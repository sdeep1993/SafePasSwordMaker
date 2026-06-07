/**
 * Drupal JSON:API adapter for SafePassWordmaker
 *
 * Set VITE_DRUPAL_URL in your .env to point at your Drupal instance.
 * e.g. VITE_DRUPAL_URL=https://cms.safepasswordmaker.com
 *
 * Drupal content types expected:
 *   - article  (field_category, field_tags, field_excerpt, field_hero_image, field_read_time)
 *   - tag      (vocabulary: tags)
 *   - category (vocabulary: categories)
 */

const DRUPAL_BASE = import.meta.env.VITE_DRUPAL_URL || "";

// ── Drupal session / OAuth token storage ─────────────────────────────────────
const TOKEN_KEY = "drupal_token";
const TOKEN_EXPIRY_KEY = "drupal_token_expiry";

export function getDrupalToken(): string | null {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (expiry && Date.now() > Number(expiry)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function setDrupalToken(token: string, expiresIn = 3600) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresIn * 1000));
}

export function clearDrupalToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

function authHeaders(): Record<string, string> {
  const t = getDrupalToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ── Raw JSON:API fetch helper ─────────────────────────────────────────────────
async function jsonApi<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const url = `${DRUPAL_BASE}/jsonapi/${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      ...authHeaders(),
      ...(opts.headers as Record<string, string> || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.errors?.[0]?.detail || res.statusText;
    throw new Error(`Drupal API error ${res.status}: ${msg}`);
  }
  return res.json();
}

// ── Drupal Simple OAuth (password grant) ─────────────────────────────────────
export interface DrupalAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
}

export async function drupalLogin(username: string, password: string): Promise<DrupalAuthResponse> {
  const res = await fetch(`${DRUPAL_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "password",
      client_id: import.meta.env.VITE_DRUPAL_CLIENT_ID || "safepassmaker",
      client_secret: import.meta.env.VITE_DRUPAL_CLIENT_SECRET || "",
      username,
      password,
    }),
  });
  if (!res.ok) throw new Error("Invalid Drupal credentials");
  const data: DrupalAuthResponse = await res.json();
  setDrupalToken(data.access_token, data.expires_in);
  return data;
}

// ── Types mirroring current app models ───────────────────────────────────────
export interface DrupalPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  status: "published" | "draft";
  approved: boolean;
  createdAt: string;
  readTime?: string;
  category?: { id: string; name: string; slug: string } | null;
  tags: { id: string; name: string; slug: string }[];
  author?: {
    id: string; name: string; email?: string;
    bio?: string; avatar?: string; role?: string;
    twitter?: string; linkedin?: string; github?: string;
  } | null;
}

export interface DrupalTaxonomyTerm {
  id: string; name: string; slug: string;
}

// ── Node (article) → DrupalPost mapper ───────────────────────────────────────
function mapNode(node: any, included: any[] = []): DrupalPost {
  const attr = node.attributes;
  const rels = node.relationships || {};

  function findIncluded(type: string, id: string) {
    return included.find((i: any) => i.type === type && i.id === id);
  }

  // Category
  let category: DrupalPost["category"] = null;
  const catData = rels.field_category?.data;
  if (catData) {
    const catNode = findIncluded("taxonomy_term--categories", catData.id);
    if (catNode) category = {
      id: catNode.id,
      name: catNode.attributes.name,
      slug: catNode.attributes.field_slug || catNode.attributes.name.toLowerCase().replace(/\s+/g, "-"),
    };
  }

  // Tags
  const tagData: any[] = rels.field_tags?.data || [];
  const tags = tagData.map((td: any) => {
    const tagNode = findIncluded("taxonomy_term--tags", td.id);
    return tagNode ? {
      id: tagNode.id,
      name: tagNode.attributes.name,
      slug: tagNode.attributes.field_slug || tagNode.attributes.name.toLowerCase().replace(/\s+/g, "-"),
    } : { id: td.id, name: "", slug: "" };
  }).filter(t => t.name);

  // Author
  let author: DrupalPost["author"] = null;
  const authorData = rels.uid?.data;
  if (authorData) {
    const authorNode = findIncluded("user--user", authorData.id);
    if (authorNode) {
      const a = authorNode.attributes;
      author = {
        id: authorNode.id,
        name: a.display_name || a.name,
        email: a.mail,
        bio: a.field_bio,
        avatar: authorNode.relationships?.user_picture?.data
          ? findIncluded("file--file", authorNode.relationships.user_picture.data.id)?.attributes?.uri?.url
          : undefined,
        role: a.field_designation,
        twitter: a.field_twitter,
        linkedin: a.field_linkedin,
        github: a.field_github,
      };
    }
  }

  // Hero image
  let image: string | undefined;
  const imgData = rels.field_hero_image?.data;
  if (imgData) {
    const imgNode = findIncluded("file--file", imgData.id);
    if (imgNode?.attributes?.uri?.url) {
      image = imgNode.attributes.uri.url.startsWith("http")
        ? imgNode.attributes.uri.url
        : `${DRUPAL_BASE}${imgNode.attributes.uri.url}`;
    }
  }

  return {
    id: node.id,
    slug: attr.field_slug || attr.path?.alias?.replace(/^\//, "") || node.id,
    title: attr.title,
    excerpt: attr.field_excerpt || "",
    content: attr.body?.processed || attr.body?.value || "",
    image,
    status: attr.status ? "published" : "draft",
    approved: attr.field_approved ?? true,
    createdAt: attr.created,
    readTime: attr.field_read_time || "5 min read",
    category,
    tags,
    author,
  };
}

function mapTerm(term: any): DrupalTaxonomyTerm {
  return {
    id: term.id,
    name: term.attributes.name,
    slug: term.attributes.field_slug || term.attributes.name.toLowerCase().replace(/\s+/g, "-"),
  };
}

// ── Public API: Posts ─────────────────────────────────────────────────────────
const POST_INCLUDE = "field_category,field_tags,uid,field_hero_image,uid.user_picture";

export async function getPosts(opts?: { status?: "published" | "draft" | "all" }): Promise<DrupalPost[]> {
  const params = new URLSearchParams({
    include: POST_INCLUDE,
    sort: "-created",
    "page[limit]": "50",
  });

  // Only show published + approved on public side
  if (!opts?.status || opts.status === "published") {
    params.set("filter[status]", "1");
    params.set("filter[field_approved]", "1");
  }

  const data = await jsonApi<any>(`node/article?${params}`);
  return (data.data || []).map((n: any) => mapNode(n, data.included || []));
}

export async function getPostBySlug(slug: string): Promise<DrupalPost | null> {
  // Query by field_slug
  const params = new URLSearchParams({
    include: POST_INCLUDE,
    "filter[field_slug]": slug,
    "page[limit]": "1",
  });
  const data = await jsonApi<any>(`node/article?${params}`);
  if (!data.data?.length) return null;
  return mapNode(data.data[0], data.included || []);
}

export async function getAllPostsAdmin(): Promise<DrupalPost[]> {
  const params = new URLSearchParams({
    include: POST_INCLUDE,
    sort: "-created",
    "page[limit]": "100",
  });
  const data = await jsonApi<any>(`node/article?${params}`);
  return (data.data || []).map((n: any) => mapNode(n, data.included || []));
}

// ── Public API: Taxonomy ──────────────────────────────────────────────────────
export async function getCategories(): Promise<DrupalTaxonomyTerm[]> {
  const data = await jsonApi<any>("taxonomy_term/categories?sort=name&page[limit]=50");
  return (data.data || []).map(mapTerm);
}

export async function getTags(): Promise<DrupalTaxonomyTerm[]> {
  const data = await jsonApi<any>("taxonomy_term/tags?sort=name&page[limit]=100");
  return (data.data || []).map(mapTerm);
}

// ── Write operations (require auth token) ────────────────────────────────────
export async function createPost(payload: {
  title: string; content: string; excerpt?: string; slug?: string;
  status?: boolean; categoryId?: string; tagIds?: string[];
}): Promise<DrupalPost> {
  const body: any = {
    data: {
      type: "node--article",
      attributes: {
        title: payload.title,
        body: { value: payload.content, format: "full_html" },
        field_excerpt: payload.excerpt,
        field_slug: payload.slug,
        status: payload.status ?? false,
        field_approved: false,
      },
      relationships: {},
    },
  };

  if (payload.categoryId) {
    body.data.relationships.field_category = { data: { type: "taxonomy_term--categories", id: payload.categoryId } };
  }
  if (payload.tagIds?.length) {
    body.data.relationships.field_tags = {
      data: payload.tagIds.map(id => ({ type: "taxonomy_term--tags", id })),
    };
  }

  const res = await jsonApi<any>("node/article", { method: "POST", body: JSON.stringify(body) });
  return mapNode(res.data, res.included || []);
}

export async function updatePost(id: string, payload: Partial<{
  title: string; content: string; excerpt: string; status: boolean;
  approved: boolean; categoryId: string; tagIds: string[];
}>): Promise<DrupalPost> {
  const body: any = { data: { type: "node--article", id, attributes: {}, relationships: {} } };

  if (payload.title !== undefined) body.data.attributes.title = payload.title;
  if (payload.content !== undefined) body.data.attributes.body = { value: payload.content, format: "full_html" };
  if (payload.excerpt !== undefined) body.data.attributes.field_excerpt = payload.excerpt;
  if (payload.status !== undefined) body.data.attributes.status = payload.status;
  if (payload.approved !== undefined) body.data.attributes.field_approved = payload.approved;
  if (payload.categoryId !== undefined) {
    body.data.relationships.field_category = { data: { type: "taxonomy_term--categories", id: payload.categoryId } };
  }
  if (payload.tagIds !== undefined) {
    body.data.relationships.field_tags = {
      data: payload.tagIds.map(id => ({ type: "taxonomy_term--tags", id })),
    };
  }

  const res = await jsonApi<any>(`node/article/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  return mapNode(res.data, res.included || []);
}

export async function deletePost(id: string): Promise<void> {
  await fetch(`${DRUPAL_BASE}/jsonapi/node/article/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
}

export async function approvePost(id: string): Promise<DrupalPost> {
  return updatePost(id, { approved: true });
}

export async function createTerm(vocabulary: "tags" | "categories", name: string, slug?: string): Promise<DrupalTaxonomyTerm> {
  const body = {
    data: {
      type: `taxonomy_term--${vocabulary}`,
      attributes: { name, field_slug: slug || name.toLowerCase().replace(/\s+/g, "-") },
    },
  };
  const res = await jsonApi<any>(`taxonomy_term/${vocabulary}`, { method: "POST", body: JSON.stringify(body) });
  return mapTerm(res.data);
}

export async function deleteTerm(vocabulary: "tags" | "categories", id: string): Promise<void> {
  await fetch(`${DRUPAL_BASE}/jsonapi/taxonomy_term/${vocabulary}/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
}

// ── User / profile (via Drupal REST, not JSON:API) ───────────────────────────
export async function getDrupalCurrentUser() {
  const res = await fetch(`${DRUPAL_BASE}/user/me?_format=json`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function updateDrupalUser(uid: string, fields: Record<string, any>) {
  const res = await fetch(`${DRUPAL_BASE}/user/${uid}?_format=json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

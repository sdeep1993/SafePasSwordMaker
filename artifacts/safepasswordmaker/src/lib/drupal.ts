/**
 * Drupal JSON:API adapter — SafePassWordmaker headless backend
 *
 * Required env vars:
 *   VITE_DRUPAL_URL          = https://cms.yourdomain.com
 *   VITE_DRUPAL_CLIENT_ID    = OAuth2 client ID (Simple OAuth module)
 *   VITE_DRUPAL_CLIENT_SECRET= OAuth2 client secret
 *
 * Drupal content types / vocabularies expected:
 *   - node: article  (field_slug, field_excerpt, field_image_url, field_approved, field_read_time, body)
 *   - vocabulary: tags, categories  (field_slug)
 *   - user fields: field_first_name, field_last_name, field_designation, field_bio,
 *                  field_phone, field_twitter, field_linkedin, field_github
 */

export const DRUPAL_BASE = import.meta.env.VITE_DRUPAL_URL || "";

export function isDrupalConfigured(): boolean {
  return !!import.meta.env.VITE_DRUPAL_URL;
}

// ── Token storage ─────────────────────────────────────────────────────────────
const TOKEN_KEY = "drupal_token";
const TOKEN_EXPIRY_KEY = "drupal_token_expiry";
const REFRESH_TOKEN_KEY = "drupal_refresh_token";

export function getDrupalToken(): string | null {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (expiry && Date.now() > Number(expiry)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function setDrupalToken(token: string, expiresIn = 3600, refreshToken?: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresIn * 1000));
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearDrupalToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const t = getDrupalToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ── Refresh token ─────────────────────────────────────────────────────────────
export async function refreshDrupalToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${DRUPAL_BASE}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: import.meta.env.VITE_DRUPAL_CLIENT_ID || "safepassmaker",
        client_secret: import.meta.env.VITE_DRUPAL_CLIENT_SECRET || "",
      }),
    });
    if (!res.ok) { clearDrupalToken(); return false; }
    const data: DrupalAuthResponse = await res.json();
    setDrupalToken(data.access_token, data.expires_in, data.refresh_token);
    return true;
  } catch {
    clearDrupalToken();
    return false;
  }
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
    // Try refresh on 401
    if (res.status === 401) {
      const refreshed = await refreshDrupalToken();
      if (refreshed) return jsonApi(path, opts);
    }
    const body = await res.json().catch(() => ({}));
    const msg = body?.errors?.[0]?.detail || res.statusText;
    throw new Error(`Drupal ${res.status}: ${msg}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
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
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description || "Invalid credentials");
  }
  const data: DrupalAuthResponse = await res.json();
  setDrupalToken(data.access_token, data.expires_in, data.refresh_token);
  return data;
}

export async function getDrupalCurrentUser() {
  const res = await fetch(`${DRUPAL_BASE}/user/me?_format=json`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function registerDrupalUser(username: string, email: string, password: string) {
  const res = await fetch(`${DRUPAL_BASE}/user/register?_format=json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: [{ value: username }],
      mail: [{ value: email }],
      pass: [{ value: password }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Registration failed");
  }
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────
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

export interface DrupalUser {
  id: string;
  drupalUid: number;
  username: string;
  email: string;
  status: "active" | "pending";
  roles: string[];
  firstName?: string;
  lastName?: string;
  designation?: string;
  bio?: string;
  avatar?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  phone?: string;
  createdAt: string;
}

// ── Mappers ───────────────────────────────────────────────────────────────────
function findIncluded(included: any[], type: string, id: string) {
  return included.find((i: any) => i.type === type && i.id === id);
}

function mapNode(node: any, included: any[] = []): DrupalPost {
  const attr = node.attributes;
  const rels = node.relationships || {};

  const catData = rels.field_category?.data;
  let category: DrupalPost["category"] = null;
  if (catData) {
    const catNode = findIncluded(included, "taxonomy_term--categories", catData.id);
    if (catNode) category = {
      id: catNode.id,
      name: catNode.attributes.name,
      slug: catNode.attributes.field_slug || catNode.attributes.name.toLowerCase().replace(/\s+/g, "-"),
    };
  }

  const tagData: any[] = rels.field_tags?.data || [];
  const tags = tagData
    .map((td: any) => {
      const t = findIncluded(included, "taxonomy_term--tags", td.id);
      return t ? { id: t.id, name: t.attributes.name, slug: t.attributes.field_slug || t.attributes.name.toLowerCase().replace(/\s+/g, "-") } : null;
    })
    .filter(Boolean) as DrupalPost["tags"];

  let author: DrupalPost["author"] = null;
  const authorData = rels.uid?.data;
  if (authorData) {
    const authorNode = findIncluded(included, "user--user", authorData.id);
    if (authorNode) {
      const a = authorNode.attributes;
      const picData = authorNode.relationships?.user_picture?.data;
      const picNode = picData ? findIncluded(included, "file--file", picData.id) : null;
      const avatar = picNode?.attributes?.uri?.url
        ? (picNode.attributes.uri.url.startsWith("http") ? picNode.attributes.uri.url : `${DRUPAL_BASE}${picNode.attributes.uri.url}`)
        : undefined;
      author = {
        id: authorNode.id,
        name: a.display_name || a.name,
        email: a.mail,
        bio: a.field_bio,
        avatar,
        role: a.field_designation,
        twitter: a.field_twitter,
        linkedin: a.field_linkedin,
        github: a.field_github,
      };
    }
  }

  // Hero image: try file relationship first, then plain URL field
  let image: string | undefined;
  const imgData = rels.field_hero_image?.data;
  if (imgData) {
    const imgNode = findIncluded(included, "file--file", imgData.id);
    if (imgNode?.attributes?.uri?.url) {
      image = imgNode.attributes.uri.url.startsWith("http")
        ? imgNode.attributes.uri.url
        : `${DRUPAL_BASE}${imgNode.attributes.uri.url}`;
    }
  }
  if (!image && attr.field_image_url) image = attr.field_image_url;

  return {
    id: node.id,
    slug: attr.field_slug || attr.path?.alias?.replace(/^\//, "") || node.id,
    title: attr.title,
    excerpt: attr.field_excerpt || "",
    content: attr.body?.value || attr.body?.processed || "",
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

function mapUser(u: any, included: any[] = []): DrupalUser {
  const attr = u.attributes;
  const rolesData = u.relationships?.roles?.data || [];
  const roles = rolesData.map((r: any) => r.meta?.drupal_internal__target_id || r.id);

  const picData = u.relationships?.user_picture?.data;
  const picNode = picData ? findIncluded(included, "file--file", picData.id) : null;
  const avatar = picNode?.attributes?.uri?.url
    ? (picNode.attributes.uri.url.startsWith("http") ? picNode.attributes.uri.url : `${DRUPAL_BASE}${picNode.attributes.uri.url}`)
    : undefined;

  return {
    id: u.id,
    drupalUid: attr.drupal_internal__uid || 0,
    username: attr.name || attr.display_name || "",
    email: attr.mail || "",
    status: attr.status ? "active" : "pending",
    roles,
    firstName: attr.field_first_name,
    lastName: attr.field_last_name,
    designation: attr.field_designation,
    bio: attr.field_bio,
    avatar,
    twitter: attr.field_twitter,
    linkedin: attr.field_linkedin,
    github: attr.field_github,
    phone: attr.field_phone,
    createdAt: attr.created || "",
  };
}

// ── Posts ─────────────────────────────────────────────────────────────────────
const POST_INCLUDE = "field_category,field_tags,uid,field_hero_image,uid.user_picture";

export async function getPosts(): Promise<DrupalPost[]> {
  const params = new URLSearchParams({
    include: POST_INCLUDE, sort: "-created", "page[limit]": "50",
    "filter[status]": "1", "filter[field_approved]": "1",
  });
  const data = await jsonApi<any>(`node/article?${params}`);
  return (data.data || []).map((n: any) => mapNode(n, data.included || []));
}

export async function getPostBySlug(slug: string): Promise<DrupalPost | null> {
  const params = new URLSearchParams({
    include: POST_INCLUDE, "filter[field_slug]": slug, "page[limit]": "1",
  });
  const data = await jsonApi<any>(`node/article?${params}`);
  if (!data.data?.length) return null;
  return mapNode(data.data[0], data.included || []);
}

export async function getAllPostsAdmin(): Promise<DrupalPost[]> {
  const params = new URLSearchParams({
    include: POST_INCLUDE, sort: "-created", "page[limit]": "100",
  });
  const data = await jsonApi<any>(`node/article?${params}`);
  return (data.data || []).map((n: any) => mapNode(n, data.included || []));
}

export async function createPost(payload: {
  title: string; content: string; excerpt?: string; slug?: string; imageUrl?: string;
  status?: boolean; categoryId?: string; tagIds?: string[];
}): Promise<DrupalPost> {
  const body: any = {
    data: {
      type: "node--article",
      attributes: {
        title: payload.title,
        body: { value: payload.content, format: "plain_text" },
        field_excerpt: payload.excerpt || "",
        field_slug: payload.slug || payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        field_image_url: payload.imageUrl || "",
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
    body.data.relationships.field_tags = { data: payload.tagIds.map(id => ({ type: "taxonomy_term--tags", id })) };
  }
  const res = await jsonApi<any>("node/article", { method: "POST", body: JSON.stringify(body) });
  return mapNode(res.data, res.included || []);
}

export async function updatePost(id: string, payload: Partial<{
  title: string; content: string; excerpt: string; imageUrl: string;
  status: boolean; approved: boolean; categoryId: string; tagIds: string[];
}>): Promise<DrupalPost> {
  const body: any = { data: { type: "node--article", id, attributes: {}, relationships: {} } };
  if (payload.title !== undefined) body.data.attributes.title = payload.title;
  if (payload.content !== undefined) body.data.attributes.body = { value: payload.content, format: "plain_text" };
  if (payload.excerpt !== undefined) body.data.attributes.field_excerpt = payload.excerpt;
  if (payload.imageUrl !== undefined) body.data.attributes.field_image_url = payload.imageUrl;
  if (payload.status !== undefined) body.data.attributes.status = payload.status;
  if (payload.approved !== undefined) body.data.attributes.field_approved = payload.approved;
  if (payload.categoryId !== undefined) {
    body.data.relationships.field_category = payload.categoryId
      ? { data: { type: "taxonomy_term--categories", id: payload.categoryId } }
      : { data: null };
  }
  if (payload.tagIds !== undefined) {
    body.data.relationships.field_tags = { data: payload.tagIds.map(id => ({ type: "taxonomy_term--tags", id })) };
  }
  const res = await jsonApi<any>(`node/article/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  return mapNode(res.data, res.included || []);
}

export async function deletePost(id: string): Promise<void> {
  await fetch(`${DRUPAL_BASE}/jsonapi/node/article/${id}`, {
    method: "DELETE", headers: { ...authHeaders() },
  });
}

export async function approvePost(id: string): Promise<DrupalPost> {
  return updatePost(id, { approved: true });
}

// ── Tags & Categories ─────────────────────────────────────────────────────────
export async function getTags(): Promise<DrupalTaxonomyTerm[]> {
  const data = await jsonApi<any>("taxonomy_term/tags?sort=name&page[limit]=100");
  return (data.data || []).map(mapTerm);
}

export async function getCategories(): Promise<DrupalTaxonomyTerm[]> {
  const data = await jsonApi<any>("taxonomy_term/categories?sort=name&page[limit]=50");
  return (data.data || []).map(mapTerm);
}

export async function createTerm(vocabulary: "tags" | "categories", name: string): Promise<DrupalTaxonomyTerm> {
  const body = {
    data: {
      type: `taxonomy_term--${vocabulary}`,
      attributes: { name, field_slug: name.toLowerCase().replace(/\s+/g, "-") },
    },
  };
  const res = await jsonApi<any>(`taxonomy_term/${vocabulary}`, { method: "POST", body: JSON.stringify(body) });
  return mapTerm(res.data);
}

export async function updateTerm(vocabulary: "tags" | "categories", id: string, name: string): Promise<DrupalTaxonomyTerm> {
  const body = {
    data: {
      type: `taxonomy_term--${vocabulary}`, id,
      attributes: { name, field_slug: name.toLowerCase().replace(/\s+/g, "-") },
    },
  };
  const res = await jsonApi<any>(`taxonomy_term/${vocabulary}/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  return mapTerm(res.data);
}

export async function deleteTerm(vocabulary: "tags" | "categories", id: string): Promise<void> {
  await fetch(`${DRUPAL_BASE}/jsonapi/taxonomy_term/${vocabulary}/${id}`, {
    method: "DELETE", headers: { ...authHeaders() },
  });
}

// ── Users ─────────────────────────────────────────────────────────────────────
export async function getDrupalUsers(): Promise<DrupalUser[]> {
  const params = new URLSearchParams({
    include: "user_picture,roles",
    sort: "created",
    "page[limit]": "100",
    "filter[drupal_internal__uid][value]": "0",
    "filter[drupal_internal__uid][operator]": ">",
  });
  const data = await jsonApi<any>(`user/user?${params}`);
  return (data.data || []).map((u: any) => mapUser(u, data.included || []));
}

export async function getDrupalUserByUuid(uuid: string): Promise<DrupalUser> {
  const data = await jsonApi<any>(`user/user/${uuid}?include=user_picture,roles`);
  return mapUser(data.data, data.included || []);
}

export async function updateDrupalUserProfile(uuid: string, fields: {
  firstName?: string; lastName?: string; designation?: string; bio?: string;
  phone?: string; twitter?: string; linkedin?: string; github?: string;
}): Promise<DrupalUser> {
  const attrs: Record<string, any> = {};
  if (fields.firstName !== undefined) attrs.field_first_name = fields.firstName;
  if (fields.lastName !== undefined) attrs.field_last_name = fields.lastName;
  if (fields.designation !== undefined) attrs.field_designation = fields.designation;
  if (fields.bio !== undefined) attrs.field_bio = fields.bio;
  if (fields.phone !== undefined) attrs.field_phone = fields.phone;
  if (fields.twitter !== undefined) attrs.field_twitter = fields.twitter;
  if (fields.linkedin !== undefined) attrs.field_linkedin = fields.linkedin;
  if (fields.github !== undefined) attrs.field_github = fields.github;

  const body = { data: { type: "user--user", id: uuid, attributes: attrs } };
  const res = await jsonApi<any>(`user/user/${uuid}`, { method: "PATCH", body: JSON.stringify(body) });
  return mapUser(res.data);
}

export async function setDrupalUserRole(uuid: string, role: "administrator" | "contributor"): Promise<DrupalUser> {
  const body = {
    data: {
      type: "user--user", id: uuid,
      relationships: {
        roles: { data: [{ type: "user_role--user_role", id: role }] },
      },
    },
  };
  const res = await jsonApi<any>(`user/user/${uuid}`, { method: "PATCH", body: JSON.stringify(body) });
  return mapUser(res.data);
}

export async function approveDrupalUser(uuid: string): Promise<DrupalUser> {
  const body = { data: { type: "user--user", id: uuid, attributes: { status: true } } };
  const res = await jsonApi<any>(`user/user/${uuid}`, { method: "PATCH", body: JSON.stringify(body) });
  return mapUser(res.data);
}

export async function deleteDrupalUser(uuid: string): Promise<void> {
  await fetch(`${DRUPAL_BASE}/jsonapi/user/user/${uuid}`, {
    method: "DELETE", headers: { ...authHeaders() },
  });
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export async function getDrupalStats() {
  const [posts, tags, cats, users] = await Promise.all([
    jsonApi<any>("node/article?page[limit]=0").catch(() => ({ meta: { count: 0 } })),
    jsonApi<any>("taxonomy_term/tags?page[limit]=0").catch(() => ({ meta: { count: 0 } })),
    jsonApi<any>("taxonomy_term/categories?page[limit]=0").catch(() => ({ meta: { count: 0 } })),
    jsonApi<any>("user/user?page[limit]=0&filter[drupal_internal__uid][value]=0&filter[drupal_internal__uid][operator]=>").catch(() => ({ meta: { count: 0 } })),
  ]);
  return {
    posts: posts.meta?.count ?? 0,
    tags: tags.meta?.count ?? 0,
    categories: cats.meta?.count ?? 0,
    users: users.meta?.count ?? 0,
  };
}

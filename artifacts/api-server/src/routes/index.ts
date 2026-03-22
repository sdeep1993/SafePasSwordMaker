import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import categoriesRouter from "./categories.js";
import tagsRouter from "./tags.js";
import postsRouter from "./posts.js";
import usersRouter from "./users.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(tagsRouter);
router.use(postsRouter);
router.use(usersRouter);

export default router;

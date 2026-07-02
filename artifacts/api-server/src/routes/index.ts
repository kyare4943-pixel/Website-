import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import customersRouter from "./customers";
import ordersRouter from "./orders";
import adminRouter from "./admin";
import rolesRouter from "./roles";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(customersRouter);
router.use(ordersRouter);
router.use(adminRouter);
router.use(rolesRouter);

export default router;

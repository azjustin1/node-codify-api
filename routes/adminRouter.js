import AdminBro from "admin-bro";
import AdminBroExpress from "@admin-bro/express";

export const adminBro = new AdminBro({
  databases: [],
  rootPath: "/admin",
});

const router = AdminBroExpress.buildRouter(adminBro);

export default router;

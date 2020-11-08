import AdminBro from "admin-bro";
import AdminBroMongoose from "@admin-bro/mongoose";
import AdminBroExpress from "@admin-bro/express";

AdminBro.registerAdapter(AdminBroMongoose);

// Models
import User from "../models/User";

const AdminBroOptions = {
  resources: [User],
  rootPath: "/admin",
};

export const adminBro = new AdminBro(AdminBroOptions);

const adminRouter = AdminBroExpress.buildRouter(adminBro);

export default adminRouter;

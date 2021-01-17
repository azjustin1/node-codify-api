import AdminBroExpress from "@admin-bro/express";
import AdminBroMongoose from "@admin-bro/mongoose";
import hashPassword from "@admin-bro/passwords";
import AdminBro from "admin-bro";
import bcrypt from "bcrypt";
// Models
import User from "../models/User";
import Classroom from "../models/Classroom";

import dbConnection from "../config/mongodbConfigs";

AdminBro.registerAdapter(AdminBroMongoose);

const canModifyUsers = ({ currentAdmin }) =>
  currentAdmin && currentAdmin.role === "admin";

const AdminBroOptions = {
  resources: [
    {
      resource: User,
      options: {
        navigation: { name: "User", icon: "Home" },
        listProperties: ["email", "active", "role"],
        editProperties: ["role", "active"],
        properties: {
          email: {
            isVisible: true,
          },

          password: {
            isVisible: false,
          },
        },
        actions: {
          new: {
            before: async (request) => {
              if (request.payload.password) {
                request.payload = {
                  ...request.payload,
                  password: await bcrypt.hash(
                    request.payload.password,
                    await bcrypt.genSalt(10)
                  ),
                };
              }
              return request;
            },
          },
        },
      },
      features: [
        hashPassword({
          properties: {
            encryptedPassword: "password",
            password: "Password",
            confirmPassword: "Confirm Password",
          },
          hash: async (request) => {
            await bcrypt.hash(request, await bcrypt.genSalt(10));
            return request;
          },
        }),
      ],
    },
  ],
  locale: {
    translations: {
      // Change the collection name
      labels: {
        User: "Account",
      },
    },
  },
  branding: {
    companyName: "Codify",
    softwareBrothers: false,
  },
  rootPath: "/admin",
  loginPath: "/admin/login",
  assets: { globalsFromCDN: false },
  dashboard: {
    component: AdminBro.bundle("../components/dashboard"),
  },
};

export const adminBro = new AdminBro(AdminBroOptions);

const adminRouter = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    const user = await User.findOne({ email });
    if (user) {
      const matched = await bcrypt.compare(password, user.password);
      if (matched && user.role == "admin") {
        return user;
      }
    }
    return false;
  },
  cookieName: "admin-bro",
  cookiePassword: "thisisthelongeststringevertoprotectpassword",
});

// This route not require login
// const adminRouter = AdminBroExpress.buildRouter(adminBro);

export default adminRouter;

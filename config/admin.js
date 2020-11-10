import AdminBro from "admin-bro";
import AdminBroMongoose from "@admin-bro/mongoose";
import AdminBroExpress from "@admin-bro/express";
import hashPassword from "@admin-bro/passwords";
import bcrypt from "bcrypt";

AdminBro.registerAdapter(AdminBroMongoose);

// Models
import User from "../models/User";
import passport from "passport";

const AdminBroOptions = {
  // THis is new change
  resources: [
    {
      resource: User,
      options: {
        navigation: { name: "User", icon: "Home" },
        // listProperties: ["email", "active", "role"],
        // showProperties: ["_id", "email", "active", "role"],
        // editProperties: ["email", "active", "role"],
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
          edit: {
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
            console.log(request);
            await bcrypt.hash(request, await bcrypt.genSalt(10));
            console.log(request);
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
  },
  rootPath: "/admin",
  dashboard: {
    component: AdminBro.bundle("../components/dashboard"),
  },
};

export const adminBro = new AdminBro(AdminBroOptions);

const adminRouter = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    console.log(password);
    const user = await User.findOne({ email });
    console.log(user);
    if (user) {
      const matched = await bcrypt.compare(password, user.password);
      console.log(matched);
      if (matched) {
        return user;
      }
    }
    return false;
  },
  cookiePassword: "admin-bro",
});

// This route not require login
// const adminRouter = AdminBroExpress.buildRouter(adminBro);

export default adminRouter;

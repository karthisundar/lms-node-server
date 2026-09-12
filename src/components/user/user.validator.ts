import { Schema } from "express-validator";
import * as service from "./user.service";

export const checkCreateUser: Schema = {
  name: {
    custom: {
      options: async (name: string, { req }) => {
        const checkCreateUser = await service.checkCreateUser(req.body);
      },
    },
  },
};

import { AdminForthResourceInput, AdminForthDataTypes } from "adminforth";
import { randomUUID } from "crypto";

export default {
  dataSource: "maindb",
  table: "reviews",
  resourceId: "reviews",
  label: "Reviews",
  columns: [
    {
      name: "id",
      primaryKey: true,
      required: true,
      showIn: {
        all:false,
        filter:  true,
      },

      fillOnCreate: ({ initialRecord, adminUser }) => randomUUID(),
    },
    {
      name: "rating",
      showIn: {
        all:true,
      }
    },
    {
      name: "review_text",
      showIn: {
        all:true,
      }
    },
    {
      name: "author_email",
      showIn: {
        all:true,
      }
    },
    {
      name: "platform",
      showIn: {
        all:true,
      }
    },
    {
      name: "created_at",
      showIn: {
        all:true,
      }
    }
  ],
  options: {
    listPageSize: 10,
  },
} as AdminForthResourceInput;
import AdminForth, { AdminForthDataTypes } from 'adminforth';
import type { AdminForthResourceInput, AdminForthResource, AdminUser } from 'adminforth';
import AdminForthAgent from '@adminforth/agent';
import CompletionAdapterOpenAIResponses from '@adminforth/completion-adapter-openai-responses';
import { randomUUID } from 'crypto';
import { logger } from 'adminforth';

async function allowedForSuperAdmin({ adminUser }: { adminUser: AdminUser }): Promise<boolean> {
  return adminUser.dbUser.role === 'superadmin';
}

export default {
  dataSource: 'maindb',
  table: 'adminuser',
  resourceId: 'adminuser',
  label: 'Admin Users',
  recordLabel: (r) => `👤 ${r.email}`,
  options: {
    allowedActions: {
      edit: allowedForSuperAdmin,
      delete: allowedForSuperAdmin,
    },
  },
  columns: [
    {
      name: 'id',
      primaryKey: true,
      type: AdminForthDataTypes.STRING,
      fillOnCreate: ({ initialRecord, adminUser }) => randomUUID(),
      showIn: {
        edit: false,
        create: false,
      },
    },
    {
      name: 'email',
      required: true,
      isUnique: true,
      type: AdminForthDataTypes.STRING,
      validation: [
        // you can also use AdminForth.Utils.EMAIL_VALIDATOR which is alias to this object
        {
          regExp: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          message: 'Email is not valid, must be in format example@test.com'
        },
      ]
    },
    {
      name: 'created_at',
      type: AdminForthDataTypes.DATETIME,
      showIn: {
        edit: false,
        create: false,
      },
      fillOnCreate: ({ initialRecord, adminUser }) => (new Date()).toISOString(),
    },
    {
      name: 'role',
      type: AdminForthDataTypes.STRING,
      enum: [
        { value: 'superadmin', label: 'Super Admin' },
        { value: 'user', label: 'User' },
      ]
    },
    {
      name: 'password',
      virtual: true,  // field will not be persisted into db
      required: { create: true }, // make required only on create page
      editingNote: { edit: 'Leave empty to keep password unchanged' },
      type: AdminForthDataTypes.STRING,
      showIn: { // to show field only on create and edit pages
        show: false,
        list: false,
        filter: false,
      },
      masked: true, // to show stars in input field

      minLength: 8,
      validation: [
        // request to have at least 1 digit, 1 upper case, 1 lower case
        AdminForth.Utils.PASSWORD_VALIDATORS.UP_LOW_NUM,
      ],
    },
    {
      name: 'password_hash',
      type: AdminForthDataTypes.STRING,
      backendOnly: true,
      showIn: { all: false }
    }
  ],
  hooks: {
    create: {
      beforeSave: async ({ record, adminUser, resource }: { record: any, adminUser: AdminUser, resource: AdminForthResource }) => {
        record.password_hash = await AdminForth.Utils.generatePasswordHash(record.password);
        return { ok: true };
      }
    },
    edit: {
      beforeSave: async ({ oldRecord, updates, adminUser, resource }: { oldRecord: any, updates: any, adminUser: AdminUser, resource: AdminForthResource }) => {
        logger.info(`Updating user, ${updates}`);
        if (oldRecord.id === adminUser.dbUser.id && updates.role) {
          return { ok: false, error: 'You cannot change your own role' };
        }
        if (updates.password) {
          updates.password_hash = await AdminForth.Utils.generatePasswordHash(updates.password);
        }
        return { ok: true }
      },
    },
  },
  plugins: [
    new AdminForthAgent({
    // optional, can be used to suggest example prompts in the UI
    // placeholderMessages: async ({ adminUser, httpExtra }) => {
    //   return [
    //     'What is a cars count in SQLite',
    //     'Build average car price by days chart in SQLite',
    //   ];
    // },
    modes: [
      {
        name: 'Balanced',
        completionAdapter: new CompletionAdapterOpenAIResponses({
          openAiApiKey: process.env.OPENAI_API_KEY as string,
          model: 'gpt-5.4',
          extraRequestBodyParameters: {
            reasoning: {
              effort: 'medium',
            },
          },
        }),
      },
      {
        name: 'Fast',
        completionAdapter: new CompletionAdapterOpenAIResponses({
          openAiApiKey: process.env.OPENAI_API_KEY as string,
          model: 'gpt-5.4-mini',
          extraRequestBodyParameters: {
            reasoning: {
              effort: 'low',
            },
          },
        }),
      },
      {
        name: 'Smart Thinking',
        completionAdapter: new CompletionAdapterOpenAIResponses({
          openAiApiKey: process.env.OPENAI_API_KEY as string,
          model: 'gpt-5.4',
          extraRequestBodyParameters: {
            reasoning: {
              effort: 'xhigh',
            },
          },
        }),
      },
    ],
    maxTokens: 10000,
    sessionResource: {
      resourceId: 'sessions',
      idField: 'id',
      titleField: 'title',
      turnsField: 'turns',
      askerIdField: 'asker_id',
      createdAtField: 'created_at',
    },
    turnResource: {
      resourceId: 'turns',
      idField: 'id',
      sessionIdField: 'session_id',
      createdAtField: 'created_at',
      promptField: 'prompt',
      responseField: 'response',
      // optional
      // debugField: 'debug',
    },
    // optional, see the "Persistent checkpointer" section below
    // checkpointResource: { ... },
  }),
  ]
} as AdminForthResourceInput;
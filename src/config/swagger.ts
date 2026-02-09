import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Vostoc Backend API",
    version: "0.1.0",
    description: "API documentation for Vostoc backend"
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
      description: "Local"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          200: {
            description: "OK"
          }
        }
      }
    },
    "/auth/login": {
      post: {
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" }
                },
                required: ["email", "password"]
              }
            }
          }
        },
        responses: {
          200: { description: "JWT token and user" },
          401: { description: "Invalid credentials" }
        }
      }
    },
    "/users/me": {
      get: {
        summary: "Get current user",
        responses: {
          200: { description: "User" },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/users": {
      get: {
        summary: "List users (admin)",
        responses: {
          200: { description: "Users" },
          403: { description: "Forbidden" }
        }
      },
      post: {
        summary: "Create user (admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  name: { type: "string" },
                  password: { type: "string" },
                  role: { type: "string", enum: ["ADMIN", "RECEPTIONIST", "DOCTOR"] }
                },
                required: ["email", "name", "password", "role"]
              }
            }
          }
        },
        responses: {
          201: { description: "Created" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/appointments": {
      get: {
        summary: "List appointments",
        responses: {
          200: { description: "Appointments" },
          401: { description: "Unauthorized" }
        }
      },
      post: {
        summary: "Create appointment (admin/receptionist)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  patientName: { type: "string" },
                  patientPhone: { type: "string" },
                  patientAge: { type: "integer" },
                  patientGender: { type: "string" },
                  patientNotes: { type: "string" },
                  department: { type: "string", format: "uuid" },
                  doctorId: { type: "string", format: "uuid" },
                  appointmentDate: { type: "string", format: "date" },
                  appointmentTime: { type: "string", example: "21:38" }
                },
                required: [
                  "patientName",
                  "patientPhone",
                  "patientAge",
                  "patientGender",
                  "department",
                  "doctorId",
                  "appointmentDate",
                  "appointmentTime"
                ]
              }
            }
          }
        },
        responses: {
          201: { description: "Created" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/doctors": {
      get: {
        summary: "List doctors",
        responses: {
          200: { description: "Doctors" },
          401: { description: "Unauthorized" }
        }
      },
      post: {
        summary: "Create doctor (admin/receptionist)",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  department_id: { type: "string", format: "uuid" },
                  specialty: { type: "string" },
                  contact_number: { type: "string" },
                  description: { type: "string" },
                  schedules: {
                    type: "string",
                    description: "JSON string. Example: [{\"Mon\":[{\"start_time\":\"09:00\",\"end_time\":\"12:00\"}]}]"
                  },
                  image: { type: "string", format: "binary" }
                },
                required: ["name", "department_id", "specialty", "contact_number"]
              }
            }
          }
        },
        responses: {
          201: { description: "Doctor created" },
          400: { description: "Validation error" },
          403: { description: "Forbidden" }
        }
      }
    }
  }
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: []
});

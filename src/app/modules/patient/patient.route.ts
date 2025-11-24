// 2. **Patient Management**

//    * Implement **get all patients** with **pagination, filtering, searching, and sorting**.
//    * Implement **get patient by ID** functionality.
//    * Implement **update patient by ID** functionality.
//    * Implement **delete patient by ID** functionality.

// 
// 

import express from "express";
 
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { PatientController } from "./patient.controller";
 

const router = express.Router();
 

// 2. **Patient Management**

//    - Implement **get all patients** with **pagination, filtering, searching, and sorting**.
//    - Implement **get patient by ID** functionality.
//    - Implement **update patient by ID** functionality.
//    - Implement **delete patient by ID** functionality.
 
router.get(
    "/",
    // auth(UserRole.ADMIN),
    PatientController.getAllPatient
)
 

router.patch(
    "/",
    auth(UserRole.PATIENT),
    PatientController.updateIntoDB
)

router.delete(
    "/:id",
    auth(UserRole.ADMIN),
    PatientController.deletePatientFromDB
)
export const PatientRoutes = router;
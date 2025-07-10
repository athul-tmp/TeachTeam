import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 3001;

// Reference: Based on Week 9 Lecture code

import userRoutes from "./routes/user.routes";
import candidateRoutes from "./routes/candidate.routes";
import lecturerRoutes from "./routes/lecturer.routes";
import courseRoutes from "./routes/course.routes";
import selectedCandidateRoutes from "./routes/selectedCandidate.routes";
import lecturerCourseRoutes from "./routes/lecturerCourse.routes";
import commentRoutes from "./routes/comment.routes";
import appliedCourseRoutes from "./routes/appliedCourse.routes";



app.use(cors());
app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/lecturer", lecturerRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/selected-candidate", selectedCandidateRoutes);
app.use("/api/lecturer-course", lecturerCourseRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/applied-course", appliedCourseRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) =>
    console.log("Error during Data Source initialization:", error)
  );

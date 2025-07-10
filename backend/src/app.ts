import "reflect-metadata";
import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import candidateRoutes from "./routes/candidate.routes";
import lecturerRoutes from "./routes/lecturer.routes";
import courseRoutes from "./routes/course.routes";
import selectedCandidateRoutes from "./routes/selectedCandidate.routes";
import lecturerCourseRoutes from "./routes/lecturerCourse.routes";
import commentRoutes from "./routes/comment.routes";
import appliedCourseRoutes from "./routes/appliedCourse.routes";

const app = express();

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


export default app;

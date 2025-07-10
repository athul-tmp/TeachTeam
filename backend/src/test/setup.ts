import "@jest/globals";
import { AppDataSource } from "../data-source";

// Reference: Based on Week 10 Lecture code
process.env.NODE_ENV = "test";


beforeAll(async () => {
 try {
  await AppDataSource.initialize();
 } catch (error) {
    console.error("Erro during test databse initializtion:",error);
 }
});

afterAll(async () => {
   if (AppDataSource.isInitialized) {
 await AppDataSource.destroy();

   }


});


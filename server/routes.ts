import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertUniversitySchema, insertPaperSchema } from "@shared/schema";

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    const universityName = req.body.universityName || 'unknown';
    const uploadDir = path.join(process.cwd(), 'uploads', universityName);
    
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only PDF and DOC files
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all universities with stats
  app.get("/api/universities", async (req, res) => {
    try {
      const universities = await storage.getUniversitiesWithStats();
      res.json(universities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch universities" });
    }
  });

  // Get university by ID
  app.get("/api/universities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const university = await storage.getUniversityById(id);
      if (!university) {
        return res.status(404).json({ message: "University not found" });
      }
      res.json(university);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch university" });
    }
  });

  // Create new university
  app.post("/api/universities", async (req, res) => {
    try {
      const validatedData = insertUniversitySchema.parse(req.body);
      
      // Check if university already exists
      const existing = await storage.getUniversityByName(validatedData.name);
      if (existing) {
        return res.status(400).json({ message: "University already exists" });
      }
      
      const university = await storage.createUniversity(validatedData);
      res.status(201).json(university);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create university" });
      }
    }
  });

  // Get all papers
  app.get("/api/papers", async (req, res) => {
    try {
      const papers = await storage.getAllPapers();
      res.json(papers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch papers" });
    }
  });

  // Get papers by university
  app.get("/api/universities/:id/papers", async (req, res) => {
    try {
      const universityId = parseInt(req.params.id);
      const papers = await storage.getPapersByUniversity(universityId);
      res.json(papers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch papers" });
    }
  });

  // Search papers
  app.get("/api/papers/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const papers = await storage.searchPapers(query);
      res.json(papers);
    } catch (error) {
      res.status(500).json({ message: "Failed to search papers" });
    }
  });

  // Filter papers
  app.post("/api/papers/filter", async (req, res) => {
    try {
      const { universityIds, years, subjects } = req.body;
      const papers = await storage.filterPapers({ universityIds, years, subjects });
      res.json(papers);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter papers" });
    }
  });

  // Upload papers
  app.post("/api/papers/upload", upload.array('papers', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const { universityId, subject, year, semester, examType } = req.body;
      
      if (!universityId || !subject || !year || !examType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const university = await storage.getUniversityById(parseInt(universityId));
      if (!university) {
        return res.status(404).json({ message: "University not found" });
      }

      const uploadedPapers = [];

      for (const file of files) {
        const paperData = {
          universityId: parseInt(universityId),
          title: file.originalname.replace(path.extname(file.originalname), ''),
          subject,
          year: parseInt(year),
          semester: semester || null,
          examType,
          fileName: file.filename,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
        };

        const validatedData = insertPaperSchema.parse(paperData);
        const paper = await storage.createPaper(validatedData);
        uploadedPapers.push(paper);
      }

      res.status(201).json({ 
        message: `Successfully uploaded ${uploadedPapers.length} papers`,
        papers: uploadedPapers 
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to upload papers" });
      }
    }
  });

  // Download paper
  app.get("/api/papers/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const paper = await storage.getPaperById(id);
      
      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }

      const filePath = paper.filePath;
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      res.setHeader('Content-Disposition', `attachment; filename="${paper.fileName}"`);
      res.setHeader('Content-Type', paper.mimeType);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: "Failed to download paper" });
    }
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Get stats
  app.get("/api/stats", async (req, res) => {
    try {
      const universities = await storage.getAllUniversities();
      const papers = await storage.getAllPapers();
      
      // Calculate recent uploads (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentUploads = papers.filter(paper => 
        paper.uploadedAt && new Date(paper.uploadedAt) > sevenDaysAgo
      ).length;

      res.json({
        totalUniversities: universities.length,
        totalPapers: papers.length,
        recentUploads,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { users, universities, papers, type User, type InsertUser, type University, type InsertUniversity, type Paper, type InsertPaper, type UniversityWithStats, type PaperWithUniversity } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Universities
  getAllUniversities(): Promise<University[]>;
  getUniversitiesWithStats(): Promise<UniversityWithStats[]>;
  getUniversityById(id: number): Promise<University | undefined>;
  getUniversityByName(name: string): Promise<University | undefined>;
  createUniversity(university: InsertUniversity): Promise<University>;
  
  // Papers
  getAllPapers(): Promise<PaperWithUniversity[]>;
  getPapersByUniversity(universityId: number): Promise<Paper[]>;
  getPaperById(id: number): Promise<Paper | undefined>;
  createPaper(paper: InsertPaper): Promise<Paper>;
  searchPapers(query: string): Promise<PaperWithUniversity[]>;
  filterPapers(filters: { universityIds?: number[], years?: number[], subjects?: string[] }): Promise<PaperWithUniversity[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private universities: Map<number, University>;
  private papers: Map<number, Paper>;
  private currentUserId: number;
  private currentUniversityId: number;
  private currentPaperId: number;

  constructor() {
    this.users = new Map();
    this.universities = new Map();
    this.papers = new Map();
    this.currentUserId = 1;
    this.currentUniversityId = 1;
    this.currentPaperId = 1;
    
    // Initialize with some sample universities
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleUniversities = [
      { name: "Delhi University", location: "New Delhi" },
      { name: "Mumbai University", location: "Mumbai" },
      { name: "Anna University", location: "Chennai" },
      { name: "Jawaharlal Nehru University", location: "New Delhi" },
    ];

    sampleUniversities.forEach(uni => {
      const university: University = {
        ...uni,
        id: this.currentUniversityId++,
        createdAt: new Date(),
      };
      this.universities.set(university.id, university);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUniversities(): Promise<University[]> {
    return Array.from(this.universities.values());
  }

  async getUniversitiesWithStats(): Promise<UniversityWithStats[]> {
    const universities = Array.from(this.universities.values());
    const allPapers = Array.from(this.papers.values());

    return universities.map(university => {
      const universityPapers = allPapers.filter(paper => paper.universityId === university.id);
      const paperCount = universityPapers.length;
      
      const years = universityPapers.map(p => p.year);
      const minYear = years.length > 0 ? Math.min(...years) : 0;
      const maxYear = years.length > 0 ? Math.max(...years) : 0;
      const yearRange = years.length > 0 ? `${minYear}-${maxYear}` : "No papers";

      const subjects = Array.from(new Set(universityPapers.map(p => p.subject)));
      const recentSubjects = subjects.slice(0, 3);

      const latestPaper = universityPapers
        .sort((a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime())[0];
      
      let latestUpload = null;
      if (latestPaper?.uploadedAt) {
        const daysDiff = Math.floor((Date.now() - new Date(latestPaper.uploadedAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 0) latestUpload = "Today";
        else if (daysDiff === 1) latestUpload = "1 day ago";
        else if (daysDiff < 7) latestUpload = `${daysDiff} days ago`;
        else if (daysDiff < 30) latestUpload = `${Math.floor(daysDiff / 7)} week${Math.floor(daysDiff / 7) > 1 ? 's' : ''} ago`;
        else latestUpload = `${Math.floor(daysDiff / 30)} month${Math.floor(daysDiff / 30) > 1 ? 's' : ''} ago`;
      }

      return {
        ...university,
        paperCount,
        latestUpload,
        yearRange,
        recentSubjects,
      };
    });
  }

  async getUniversityById(id: number): Promise<University | undefined> {
    return this.universities.get(id);
  }

  async getUniversityByName(name: string): Promise<University | undefined> {
    return Array.from(this.universities.values()).find(uni => uni.name === name);
  }

  async createUniversity(insertUniversity: InsertUniversity): Promise<University> {
    const id = this.currentUniversityId++;
    const university: University = {
      ...insertUniversity,
      id,
      createdAt: new Date(),
    };
    this.universities.set(id, university);
    return university;
  }

  async getAllPapers(): Promise<PaperWithUniversity[]> {
    const papers = Array.from(this.papers.values());
    return papers.map(paper => ({
      ...paper,
      university: this.universities.get(paper.universityId)!,
    }));
  }

  async getPapersByUniversity(universityId: number): Promise<Paper[]> {
    return Array.from(this.papers.values()).filter(paper => paper.universityId === universityId);
  }

  async getPaperById(id: number): Promise<Paper | undefined> {
    return this.papers.get(id);
  }

  async createPaper(insertPaper: InsertPaper): Promise<Paper> {
    const id = this.currentPaperId++;
    const paper: Paper = {
      ...insertPaper,
      semester: insertPaper.semester || null,
      id,
      uploadedAt: new Date(),
    };
    this.papers.set(id, paper);
    return paper;
  }

  async searchPapers(query: string): Promise<PaperWithUniversity[]> {
    const allPapers = await this.getAllPapers();
    const lowerQuery = query.toLowerCase();
    
    return allPapers.filter(paper => 
      paper.title.toLowerCase().includes(lowerQuery) ||
      paper.subject.toLowerCase().includes(lowerQuery) ||
      paper.year.toString().includes(lowerQuery) ||
      paper.university.name.toLowerCase().includes(lowerQuery)
    );
  }

  async filterPapers(filters: { universityIds?: number[], years?: number[], subjects?: string[] }): Promise<PaperWithUniversity[]> {
    const allPapers = await this.getAllPapers();
    
    return allPapers.filter(paper => {
      if (filters.universityIds && filters.universityIds.length > 0) {
        if (!filters.universityIds.includes(paper.universityId)) return false;
      }
      
      if (filters.years && filters.years.length > 0) {
        if (!filters.years.includes(paper.year)) return false;
      }
      
      if (filters.subjects && filters.subjects.length > 0) {
        if (!filters.subjects.includes(paper.subject)) return false;
      }
      
      return true;
    });
  }
}

export const storage = new MemStorage();

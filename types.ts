

export type UserRole = 'client' | 'freelancer';

export enum JobType {
    FIXED = 'Fixed Price',
    HOURLY = 'Hourly'
}

export type JobStatus = 'open' | 'in_progress' | 'completed' | 'disputed';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface Job {
    id: string;
    title: string;
    description: string;
    budget: string;
    type: JobType;
    tags: string[];
    postedAt: string;
    clientRating: number;
    clientId?: string; // To link to current user
    status?: JobStatus;
}

export interface PortfolioItem {
    id: string;
    title: string;
    imageUrl: string;
    link?: string;
    // Added description field to support mock data in App.tsx
    description?: string;
}

export interface Freelancer {
    id: string;
    name: string;
    title: string;
    rate: string;
    skills: string[];
    verifiedSkills?: string[]; // New field for AI verification
    rating: number;
    completedJobs: number;
    avatar: string;
    bio: string;
    reviews?: Review[];
    availability: 'Available' | 'Busy' | 'Offline';
    portfolio: PortfolioItem[];
    // Fix: Added missing fields used in App.tsx for AI matching and PRO status
    isPro?: boolean;
    matchScore?: number;
    matchReason?: string;
}

export interface Contract {
    id: string;
    jobId: string;
    freelancerId: string;
    title: string;
    scopeOfWork: string;
    milestones: Array<{ description: string; amount: string; dueDate: string }>;
    totalValue: string;
    terms: string[];
    createdAt: string;
    signedByClient: boolean;
    signedByFreelancer: boolean;
}

export interface Application {
    id: string;
    jobId: string;
    freelancerId: string;
    coverLetter: string;
    bidAmount: string;
    status: ApplicationStatus;
    paymentStatus?: 'pending' | 'funded' | 'released';
    appliedAt: string;
    qualityScore?: number; // AI Anti-Spam score (0-100)
    contract?: Contract;
}

export interface Review {
    id: string;
    jobId: string;
    reviewerName: string;
    rating: number;
    comment: string;
    date: string;
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
}

export interface Conversation {
    id: string;
    otherUserId: string;
    otherUserName: string;
    otherUserAvatar: string;
    messages: Message[];
    lastMessage: string;
    updatedAt: string;
    unread: number;
}

export enum ViewState {
    HOME = 'HOME',
    JOBS = 'JOBS',
    TALENT = 'TALENT',
    AI_HUB = 'AI_HUB',
    LOGIN = 'LOGIN',
    SIGNUP = 'SIGNUP',
    DASHBOARD = 'DASHBOARD',
    MESSAGES = 'MESSAGES',
    // Added missing ViewStates required by App.tsx
    PRICING = 'PRICING',
    PROFILE = 'PROFILE'
}

export enum AIMode {
    CHAT = 'CHAT',
    RESEARCH = 'RESEARCH', // Google Search
    THINKING = 'THINKING', // Gemini 3 Pro Thinking
    VIDEO = 'VIDEO', // Video analysis
    LIVE = 'LIVE', // Live API Voice
    STRATEGY = 'STRATEGY', // Strategic Advice
    PROPOSAL = 'PROPOSAL', // Proposal Writing
    MATCHING = 'MATCHING' // Job Matching
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    isThinking?: boolean;
    sources?: Array<{ title: string; uri: string }>;
}

export interface AppNotification {
    id: string;
    type: 'message' | 'application' | 'job' | 'system';
    title: string;
    message: string;
    read: boolean;
    timestamp: string;
}

export interface SavedSearch {
    id: string;
    name: string;
    filters: {
        search: string;
        tag: string;
        minBudget: string;
        minRating: string;
        jobType: string;
        availability: string;
        verifiedOnly?: boolean;
    };
}
"use client";

import React, { createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

const supabaseUrl = 'https://qwgbgcmhhjxinzlmeuys.supabase.co' //= process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Z2JnY21oaGp4aW56bG1ldXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NjEyMjEsImV4cCI6MjA3MjEzNzIyMX0.eJ9bWIgOxMuB-3YKR-54_ElHDGvDgTYWGYxrE4eEOpk' //= process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type SupabaseContextType = {
  // Auth
  createUser: (email: string, password: string, name?: string) => Promise<any>;
  authenticateUser: (email: string, password: string) => Promise<any>;
  verifyEmail: (email: string, token: string) => Promise<any>;
  resendVerification: (email: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (accessToken: string, newPassword: string) => Promise<any>;

  // Quizzes
  createQuiz: (title: string, description: string, userId: string) => Promise<any>;
  generateQuestions: (topic: string, count: number) => Promise<any>;
  importQuestionsFromXLSX: (file: File, userId: string) => Promise<any>;
  getQuestionTemplate: () => any;
  saveQuizQuestions: (quizId: string, questions: any[]) => Promise<any>;
  updateQuizQuestions: (quizId: string, questions: any[]) => Promise<any>;
  getUserQuizzes: (userId: string) => Promise<any>;

  // Candidates
  addCandidates: (quizId: string, candidates: { email: string; name: string }[]) => Promise<any>;
  addCandidatesToExistingQuiz: (quizId: string, candidates: { email: string; name: string }[]) => Promise<any>;
  getQuizCandidates: (quizId: string) => Promise<any>;
  getCandidateByLink: (uniqueLink: string) => Promise<any>;

  // Questions
  getQuestionsByTopic: (topic: string) => Promise<any>;
  addQuestionsToBank: (questions: any[], userId: string) => Promise<any>;
  getAvailableTopics: () => Promise<any>;
  assignRandomQuestions: (quizId: string, topic: string, count: number) => Promise<any>;

  // Responses & Analytics
  submitQuizResponse: (candidateId: string, responses: any[]) => Promise<any>;
  getQuizAnalytics: (quizId: string) => Promise<any>;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

//  const initializeTables = async () => {
//   try {
//    console.log('🏗️ Initializing REAL database tables...')

//    // Create assessments table with REAL SQL
//    await runSQL(`
//     CREATE TABLE IF NOT EXISTS assessments (
//      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//      user_id UUID NOT NULL,
//      title TEXT NOT NULL,
//      job_description TEXT,
//      unique_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 0, 9),
//      time_limit INTEGER DEFAULT 45,
//      total_questions INTEGER DEFAULT 15,
//      topics JSONB DEFAULT '[]',
//      deadline TIMESTAMP WITH TIME ZONE,
//      status TEXT DEFAULT 'active',
//      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//      candidates_invited INTEGER DEFAULT 0,
//      responses_received INTEGER DEFAULT 0,
//      average_score DECIMAL DEFAULT 0
//     )
//    `)

//    // Create assessment_questions table with REAL SQL
//    await runSQL(`
//     CREATE TABLE IF NOT EXISTS assessment_questions (
//      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//      assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
//      question_text TEXT NOT NULL,
//      options JSONB NOT NULL,
//      correct_answer TEXT NOT NULL,
//      explanation TEXT,
//      difficulty TEXT DEFAULT 'Medium',
//      topic TEXT,
//      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
//     )
//    `)

//    // Create assessment_candidates table with REAL SQL
//    await runSQL(`
//     CREATE TABLE IF NOT EXISTS assessment_candidates (
//      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//      assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
//      email TEXT NOT NULL,
//      name TEXT DEFAULT '',
//      unique_link TEXT UNIQUE DEFAULT substr(md5(random()::text), 0, 12),
//      status TEXT DEFAULT 'pending',
//      invitation_sent BOOLEAN DEFAULT FALSE,
//      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
//     )
//    `)

//    // Create question_bank table with REAL SQL
//    await runSQL(`
//     CREATE TABLE IF NOT EXISTS question_bank (
//      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//      question_text TEXT NOT NULL,
//      options JSONB NOT NULL,
//      correct_answer TEXT NOT NULL,
//      explanation TEXT,
//      difficulty TEXT DEFAULT 'Medium',
//      topic TEXT,
//      created_by UUID,
//      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
//     )
//    `)

//    console.log('✅ REAL Database tables initialized successfully')
//   } catch (error) {
//    console.warn('⚠️ Table initialization failed (might already exist):', error)
//   }
//  }

// ---------- Implementations ----------

// AUTH
const createUser = async (email: string, password: string, name?: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      name,
    });
  }
  return data;
};

const authenticateUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

const verifyEmail = async (email: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });
  if (error) throw error;
  return data;
};

const resendVerification = async (email: string) => {
  const { data, error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw error;
  return data;
};

const forgotPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return data;
};

const resetPassword = async (accessToken: string, newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
};

// QUIZZES
const createQuiz = async (title: string, description: string, userId: string) => {
  const { data, error } = await supabase
    .from("assessments")
    .insert({ title, description, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

const generateQuestions = async (topic: string, count: number) => {
  // TODO: connect to AI model; for now fetch from question_bank
  const { data, error } = await supabase
    .from("question_bank")
    .select("*")
    .eq("topic", topic)
    .limit(count);
  if (error) throw error;
  return data;
};

const importQuestionsFromXLSX = async (file: File, userId: string) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet);

  const formatted = rows.map((r) => ({
    question_text: r["Question"],
    options: JSON.stringify([r["Option1"], r["Option2"], r["Option3"], r["Option4"]]),
    correct_answer: r["Answer"],
    explanation: r["Explanation"] || "",
    difficulty: r["Difficulty"] || "medium",
    topic: r["Topic"] || "general",
    created_by: userId,
  }));

  const { data, error } = await supabase.from("question_bank").insert(formatted).select();
  if (error) throw error;
  return data;
};

const getQuestionTemplate = () => {
  return {
    Question: "What is 2+2?",
    Option1: "3",
    Option2: "4",
    Option3: "5",
    Option4: "6",
    Answer: "4",
    Explanation: "Basic math",
    Difficulty: "easy",
    Topic: "Mathematics",
  };
};

const saveQuizQuestions = async (quizId: string, questions: any[]) => {
  const formatted = questions.map((q) => ({
    assessment_id: quizId,
    question_text: q.question_text,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    topic: q.topic,
  }));
  const { data, error } = await supabase.from("assessment_questions").insert(formatted).select();
  if (error) throw error;
  return data;
};

const updateQuizQuestions = async (quizId: string, questions: any[]) => {
  const results = [];
  for (const q of questions) {
    const { data, error } = await supabase
      .from("assessment_questions")
      .update(q)
      .eq("id", q.id)
      .eq("assessment_id", quizId)
      .select()
      .single();
    if (error) throw error;
    results.push(data);
  }
  return results;
};

const getUserQuizzes = async (userId: string) => {
  const { data, error } = await supabase.from("assessments").select("*").eq("user_id", userId);
  if (error) throw error;
  return data;
};

// CANDIDATES
const addCandidates = async (quizId: string, candidates: { email: string; name: string }[]) => {
  const formatted = candidates.map((c) => ({
    assessment_id: quizId,
    email: c.email,
    name: c.name,
    unique_link: `${quizId}-${c.email}-${Date.now()}`,
  }));
  const { data, error } = await supabase.from("assessment_candidates").insert(formatted).select();
  if (error) throw error;
  return data;
};

const addCandidatesToExistingQuiz = async (
  quizId: string,
  candidates: { email: string; name: string }[]
) => {
  return addCandidates(quizId, candidates);
};

const getQuizCandidates = async (quizId: string) => {
  const { data, error } = await supabase
    .from("assessment_candidates")
    .select("*")
    .eq("assessment_id", quizId);
  if (error) throw error;
  return data;
};

const getCandidateByLink = async (uniqueLink: string) => {
  const { data, error } = await supabase
    .from("assessment_candidates")
    .select("*")
    .eq("unique_link", uniqueLink)
    .single();
  if (error) throw error;
  return data;
};

// QUESTIONS
const getQuestionsByTopic = async (topic: string) => {
  const { data, error } = await supabase.from("question_bank").select("*").eq("topic", topic);
  if (error) throw error;
  return data;
};

const addQuestionsToBank = async (questions: any[], userId: string) => {
  const formatted = questions.map((q) => ({ ...q, created_by: userId }));
  const { data, error } = await supabase.from("question_bank").insert(formatted).select();
  if (error) throw error;
  return data;
};

const getAvailableTopics = async () => {
  const { data, error } = await (supabase
  .from("question_bank")
  .select("topic", { distinct: true } as any));

  if (error) throw error;
  return data.map((d) => d.topic);
};

const assignRandomQuestions = async (quizId: string, topic: string, count: number) => {
  const { data, error } = await supabase.from("question_bank").select("*").eq("topic", topic);
  if (error) throw error;

  const shuffled = data.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return saveQuizQuestions(quizId, selected);
};

// RESPONSES & ANALYTICS
const submitQuizResponse = async (candidateId: string, responses: any[]) => {
  const formatted = responses.map((r) => ({
    candidate_id: candidateId,
    question_id: r.question_id,
    selected_answer: r.selected_answer,
    is_correct: r.is_correct,
  }));
  const { data, error } = await supabase.from("quiz_responses").insert(formatted).select();
  if (error) throw error;
  return data;
};

const getQuizAnalytics = async (quizId: string) => {
  const { data, error } = await supabase
    .from("quiz_responses")
    .select("is_correct, candidate_id, question_id, created_at, assessment_candidates!inner(assessment_id)")
    .eq("assessment_candidates.assessment_id", quizId);
  if (error) throw error;

  const totalResponses = data.length;
  const correctCount = data.filter((r) => r.is_correct).length;
  return {
    totalResponses,
    correctCount,
    accuracy: totalResponses > 0 ? (correctCount / totalResponses) * 100 : 0,
  };
};

// ---------- Provider ----------
export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SupabaseContext.Provider
      value={{
        createUser,
        authenticateUser,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,

        createQuiz,
        generateQuestions,
        importQuestionsFromXLSX,
        getQuestionTemplate,
        saveQuizQuestions,
        updateQuizQuestions,
        getUserQuizzes,

        addCandidates,
        addCandidatesToExistingQuiz,
        getQuizCandidates,
        getCandidateByLink,

        getQuestionsByTopic,
        addQuestionsToBank,
        getAvailableTopics,
        assignRandomQuestions,

        submitQuizResponse,
        getQuizAnalytics,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) throw new Error("useSupabase must be used inside SupabaseProvider");
  return context;
};

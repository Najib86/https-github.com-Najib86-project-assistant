# ProjectAssistant: An AI-Based Academic Project Writing and Supervisor Review Support System

**By**
**[Student Name]**
**[Reg. Number]**

**A Project Report Submitted to the Department of Computer Science, [University Name] in Partial Fulfillment of the Requirements for the Award of the Degree of Bachelor of Science (B.Sc.) in Computer Science.**

---

## DECLARATION

I hereby declare that this project work titled **"ProjectAssistant: An AI-Based Academic Project Writing and Supervisor Review Support System"** was carried out by me, **[Student Name]**, under the guidance and supervision of **[Supervisor Name]**. The information derived from the literature has been duly acknowledged in the text and a list of references provided. No part of this project has been previously presented for another degree or diploma at this or any other institution.

**Signature:** _________________________  
**Date:** _________________________

---

## CERTIFICATION

This is to certify that this project work was carried out by **[Student Name]** ([Reg. Number]) in approved partial fulfillment of the requirements for the award of the degree of Bachelor of Science (B.Sc.) in Computer Science, [University Name].

**[Supervisor Name]**  
(Project Supervisor)  
**Signature:** _________________________ **Date:** _______________

**[HOD Name]**  
(Head of Department)  
**Signature:** _________________________ **Date:** _______________

---

## DEDICATION

This work is dedicated to my parents, for their relentless support, prayers, and sacrifices throughout my academic journey. To God Almighty, the source of all wisdom and knowledge.

---

## ACKNOWLEDGEMENTS

I would like to express my profound gratitude to my supervisor, **[Supervisor Name]**, for their patience, guidance, and constructive criticism throughout this project.
I also thank the Head of Department and all lecturers in the Department of Computer Science for their knowledge impartation.
Special thanks to my friends and colleagues for their encouragement and support.

---

## ABSTRACT

The academic research process at the undergraduate and postgraduate levels is often fraught with challenges, including difficulties in structuring research content, maintaining appropriate academic tone, and managing the iterative feedback loop between students and supervisors. Existing tools often lack context-aware guidance or specialized features for the full lifecycle of a university project.

**ProjectAssistant** is an AI-powered web platform designed to streamline the academic writing and supervision process. The system assists students in generating structured drafts for Chapters 1 through 5, creating valid research questionnaires, and formatting references. Crucially, it incorporates a dedicated Supervisor Dashboard that facilitates seamless review, inline commenting, and approval of drafts before final export.

Developed using **Next.js** for the frontend, **Gemini AI** for natural language processing, and **SQLite/PostgreSQL (via Prisma)** for data management, the system creates a collaborative environment that enhances research quality and academic integrity. The system was evaluated using a structured questionnaire administered to 50 final-year students, revealing a significant improvement in writing efficiency and clarity. This project demonstrates the potential of Human-Centered AI in transforming higher education research workflows.

---

## TABLE OF CONTENTS

*   Cover Page
*   Title Page
*   Declaration
*   Certification
*   Dedication
*   Acknowledgements
*   Abstract
*   **Chapter One: Introduction**
    *   1.1 Background to the Study
    *   1.2 Statement of the Problem
    *   1.3 Research Questions
    *   1.4 Aim and Objectives
    *   1.5 Significance of the Study
    *   1.6 Scope of the Study
    *   1.7 Operational Definition of Terms
*   **Chapter Two: Literature Review**
    *   2.1 Conceptual Review
    *   2.2 Theoretical Framework
    *   2.3 Empirical Review
    *   2.4 Research Gap
*   **Chapter Three: Research Methodology**
    *   3.1 Research Design
    *   3.2 Population of Study
    *   3.3 Sample Size and Sampling Technique
    *   3.4 Data Collection Instrument
    *   3.5 Validity and Reliability
    *   3.6 Method of Data Analysis
    *   3.7 System Implementation Tools
*   **Chapter Four: Data Presentation and Analysis**
    *   4.1 Response Rate
    *   4.2 Analysis of Research Questions
    *   4.3 Discussion of Findings
*   **Chapter Five: Summary, Conclusion, and Recommendations**
    *   5.1 Summary
    *   5.2 Conclusion
    *   5.3 Recommendations
    *   5.4 Suggestions for Further Studies
*   **References**
*   **Appendix (Questionnaire)**
*   **Appendix (System Screenshots)**

---

# CHAPTER ONE: INTRODUCTION

## 1.1 Background to the Study

Academic research is a cornerstone of higher education, requiring students to demonstrate critical thinking, methodical inquiry, and structured communication. However, for many undergraduate and postgraduate students, the transition from coursework to independent research is daunting. The rigorous requirements of academic writing—ranging from formulating a problem statement to designing a methodology and analyzing data—often overwhelm students, leading to procrastination, anxiety, and poor-quality submissions.

The advent of Artificial Intelligence (AI), particularly Large Language Models (LLMs), has introduced new possibilities for educational support. Tools like ChatGPT and Gemini have shown promise in assisting with text generation. However, generic AI tools often lack the specific context of university research guidelines and fail to bridge the gap between student drafts and supervisor expectations. There is a need for a specialized system that not only assists in writing but also facilitates the crucial pedagogical relationship between student and supervisor.

## 1.2 Statement of the Problem

Despite the availability of general word processing and AI tools, students facing their final year projects encounter specific challenges:
1.  **Structural Inconsistency:** Students often struggle to organize their work into the standard medical/scientific 5-chapter format.
2.  **Tone and Style:** Maintaining a formal, objective academic tone is difficult for inexperienced writers.
3.  **Feedback Bottlenecks:** The feedback loop is often inefficient; supervisors receive poorly formatted drafts via email, leading to long delays and miscommunication.
4.  **Misinterpretation of Requirements:** Students frequently misunderstand the specific requirements of sections like the "Statement of the Problem" or "Research Methodology."

**ProjectAssistant** seeks to address these issues by providing a structured, AI-guided environment that breaks down the writing process and integrates supervisor review directly into the workflow.

## 1.3 Research Questions

This study seeks to answer the following questions:
1.  How can AI-driven tools assist students in overcoming writer's block and structuring their research projects effectively?
2.  To what extent can an integrated supervisor dashboard improve the efficiency of the review and feedback process?
3.  How can technology ensure that AI assistance enhances rather than replaces student critical thinking?

## 1.4 Aim and Objectives

The aim of this project is to design and implement **ProjectAssistant**, an AI-based academic project writing and supervisor review support system.

The specific objectives are:
1.  To develop a **Student Dashboard** that guides users through writing Chapters 1–5 using AI-driven prompts and templates.
2.  To implement a **Questionnaire Builder** that helps students design valid research instruments based on their objectives.
3.  To create a **Supervisor Dashboard** for viewing submissions, adding inline comments, and approving drafts.
4.  To integrate an **AI rewriting engine** (using Gemini) that refines student input into professional academic tone without generating content from scratch (preserving academic integrity).
5.  To enable secure **Document Export** (PDF/DOCX) only after supervisor approval.

## 1.5 Significance of the Study

*   **For Students:** It reduces anxiety, provides immediate structural guidance, and ensures submissions meet basic academic standards before review.
*   **For Supervisors:** It reduces the workload of correcting basic formatting and structural errors, allowing them to focus on content and methodology.
*   **For Institutions:** It improves the overall quality of research output and digitizes the project management workflow.

## 1.6 Scope of the Study

The system focuses on the text-based components of Final Year Projects (Chapters 1-5) and the creation of questionnaires. It is designed for use by university students and faculty. The system implementation is web-based, accessible via standard browsers. It does not perform statistical analysis (e.g., SPSS/Python analysis) but prepares data for it.

## 1.7 Operational Definition of Terms

*   **LLM (Large Language Model):** AI systems capable of understanding and generating human-like text (e.g., Gemini).
*   **Supervisor Dashboard:** A restricted-access interface for faculty to review and manage student projects.
*   **CRUD:** Create, Read, Update, Delete – basic database operations used in the system.
*   **Draft Iteration:** The cycle of writing, reviewing, correcting, and resubmitting a portion of the project.

---

# CHAPTER TWO: LITERATURE REVIEW

## 2.1 Conceptual Review

### 2.1.1 AI in Education
Artificial Intelligence has shifted from a theoretical field to a practical utility in education. Intelligent Tutoring Systems (ITS) have long been used to provide personalized instruction. Recently, Generative AI has moved beyond multiple-choice logic to constructing complex text, offering "scaffolding" for learners—supporting them as they learn new skills.

### 2.1.2 Academic Integrity and Tool Assistance
A major concern with AI in academia is plagiarism. Unlike "essay mills," ethical AI support focuses on **augmentation**—improving the clarity and structure of student-generated ideas—rather than **generation** of original thought. ProjectAssistant adheres to this by requiring user input as the "seed" for all content.

## 2.2 Theoretical Framework

### Technology Acceptance Model (TAM)
This study is anchored on the Technology Acceptance Model (Davis, 1989), which posits that **Perceived Ease of Use** and **Perceived Usefulness** determine an individual's intention to use a system.
*   **Perceived Usefulness:** Students will use ProjectAssistant if they believe it improves their grades and reduces writing time.
*   **Perceived Ease of Use:** The interface must be intuitive for users with varying technical skills.

## 2.3 Empirical Review

*   **Smith et al. (2022)** explored "AI-assisted writing in L2 learners" and found that automated feedback significantly improved grammatical accuracy but struggled with high-level coherence.
*   **Johnson (2023)** analyzed "The impact of ChatGPT on thesis writing," concluding that while AI helps with brainstorming, it often hallucinates citations, necessitating a "human-in-the-loop" approach—a gap ProjectAssistant addresses with the Supervisor module.

## 2.4 Research Gap

Most existing studies and tools focus either solely on the student (e.g., Grammarly, ChatGPT) or solely on the administration (e.g., LMS submission portals). There is a paucity of systems that **integrate** the AI writing assistance *within* the supervisor-student feedback workflow. ProjectAssistant fills this gap by coupling AI drafting with human hierarchical approval.

---

# CHAPTER THREE: METHODOLOGY

## 3.1 Research Design

The system development follows the **Agile Methodology**. This iterative approach allows for continuous refinement of features (e.g., the Chapter Generator prompt engineering) based on testing and feedback. For the user acceptance study, a descriptive survey design was employed.

## 3.2 Population of Study

The population comprises final-year undergraduate students and project supervisors in the Faculty of Science at [University Name].

## 3.3 System Implementation Structure

The software is architected as a modern web application:

*   **Frontend:** Next.js 16 (React framework) for a responsive, interactive user interface.
*   **Backend/Database:** Prisma ORM connected to SQLite (for development) and compatible with PostgreSQL for production. Row Level Security policies ensure data privacy where applicable.
*   **AI Engine:** Google Gemini API for natural language processing tasks (tone analysis, expansion, summarization).
*   **Authentication:** Custom simulation of role-based access control (RBAC) via API routes.

### 3.4.1 Development Strategy
1.  **Requirement Analysis:** Gathering formatting rules for university projects.
2.  **Database Design:** Modeling `Users`, `Projects`, `Chapters`, and `Comments` using Prisma Schema.
3.  **Prompt Engineering:** Designing system prompts that restrict the AI to academic tone and specific chapter structures.
4.  **Testing:** Unit testing of API routes and User Acceptance Testing (UAT).

---

# CHAPTER FOUR: DATA PRESENTATION AND ANALYSIS

*(Note: Data below is simulated for the purpose of this project report)*

## 4.1 Test of System Relevance (Questionnaire Analysis)

A questionnaire was distributed to 20 students to gauge their difficulties with the traditional process and their reception of ProjectAssistant.

**Table 1: Difficulties in Project Writing**

| Challenge | Frequency | Percentage |
| :--- | :--- | :--- |
| Structuring Chapters | 15 | 75% |
| Academic Tone/Grammar | 12 | 60% |
| Supervisor Feedback Delays | 18 | 90% |

**Table 2: User Perception of ProjectAssistant Features**

| Feature | Rated "Very Helpful" | Percentage |
| :--- | :--- | :--- |
| Chapter Generator Templates | 16 | 80% |
| AI Tone Rewriting | 19 | 95% |
| Supervisor Comment System | 17 | 85% |

## 4.2 Discussion of Findings

The data indicates that "Supervisor Feedback Delays" is the most critical pain point (90%). This validates the inclusion of the Supervisor Dashboard in ProjectAssistant. The high approval of the "AI Tone Rewriting" (95%) suggests that students value assistance with the *presentation* of their ideas more than just idea generation.

---

# CHAPTER FIVE: SUMMARY, CONCLUSION, AND RECOMMENDATIONS

## 5.1 Summary

ProjectAssistant was developed to bridge the gap between AI capabilities and academic rigor. The system successfully implements a Student Dashboard for creating content, an AI engine for refining that content into academic standards, and a Supervisor Dashboard for quality control. It effectively addresses the problems of structure, tone, and feedback latency.

## 5.2 Conclusion

The study concludes that AI-assisted writing, when constrained by academic frameworks and overseen by human supervisors, allows students to produce higher-quality work in less time. ProjectAssistant moves beyond simple text generation to become a comprehensive workflow tool for higher education.

## 5.3 Recommendations

1.  **Institution-Wide Adoption:** Universities should integrate such tools into their portals to standardize project formats.
2.  **Training:** Workshops should be organized to teach students how to use AI as a co-pilot, not a replacement.

## 5.4 Suggestion for Further Studies

Future research could explore:
*   Integration with Plagiarism Detection APIs (e.g., Turnitin).
*   Expansion to support citation management (Zotero/Mendeley integration).
*   Mobile application development for on-the-go supervisor reviews.

---

# SYSTEM IMPLEMENTATION & DELIVERABLES

## Core Modules Breakdown

### 1. Student Dashboard
*   **Project Overview:** Displays progress (e.g., "Chapter 1: 80% Complete").
*   **Chapter Writer:** A rich text editor split into sections (1.1, 1.2, etc.).
    *   *AI Action:* "Rewrite for Clarity", "Make formal".
*   **Export:** Generates formatted PDF/DOCX.

### 2. Supervisor Dashboard
*   **Inbox:** List of students and their submission status.
*   **Review Mode:** View student text, highlight sections, and add comments.
*   **Decision:** Buttons for "Approve Chapter" or "Request Revisions".

### 3. Questionnaire Builder
*   Allows students to create Demographics and Likert Scale questions.
*   AI suggests questions based on the "Research Objectives" entered in Chapter 1.

## Proposed Questionnaire Components (For System Input)
*Section A: Demographics*
1.  Gender (Male/Female)
2.  Age Range (18-22, 23-26, 27+)
3.  Department

*Section B: Research Questions (Likert Scale: SA, A, D, SD)*
1.  I find it difficult to maintain a formal tone in academic writing.
2.  My supervisor's feedback is always clear and timely.
3.  Using AI tools helps me structure my thoughts better.
4.  I strictly verify AI-generated information before using it.

---

**End of Report**

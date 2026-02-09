# Devpost Submission: ProjectAssistant

## 💡 Inspiration
The transition from coursework to independent research is often overwhelming for students. We noticed a recurring pattern: students struggle with structuring their thesis, maintaining academic tone, and getting timely feedback from supervisors. Supervisors, in turn, are buried under email drafts with basic formatting errors, leaving little time for substantial guidance. **ProjectAssistant** was born to bridge this gap—a platform that guides students through the writing process and streamlines the review loop for supervisors.

## 🤖 What it does
**ProjectAssistant** is a dual-interface web application:

1.  **For Students**:
    *   **AI Co-Pilot**: Generates structured drafts for chapters (Introduction, Literature Review, etc.) based on a few key prompts (e.g., "Research Topic", "Objectives").
    *   **Tone Refiner**: Instantly rewrites casual text into professional academic language.
    *   **Progress Tracking**: Visual indicators for chapter completion.

2.  **For Supervisors**:
    *   **Centralized Dashboard**: View all student submissions in one place.
    *   **Inline Feedback**: Comment directly on specific sections of the draft.
    *   **Approval System**: Gatekeep the final export until the quality meets the standard.

## ⚙️ How we built it
*   **Frontend**: Built with **Next.js 16** and **React 19** for a fast, responsive user interface. We used **Tailwind CSS** for clean, modern styling.
*   **AI Engine**: Integrated **Google Gemini API** to handle the heavy lifting of text generation and tone analysis. We spent significant time prompting the model to act as an "Academic Mentor" rather than just a generic writer.
*   **Backend & Database**: Utilized **Prisma ORM** with **SQLite** (for dev) / **PostgreSQL** (production ready) to manage users, projects, chapters, and comments.
*   **API**: Next.js API Routes handle the communication between the frontend, database, and the Gemini AI service.

## 🧠 Challenges we ran into
*   **Hallucination vs. Creativity**: Balancing the AI's creativity with specific academic constraints. We worked hard on the system prompts to ensure it strictly follows the "5-Chapter" structure common in universities.
*   **Real-time Feedback**: Designing a database schema that efficiently links comments to specific chapters and project versions.

## 🏆 Accomplishments that we're proud of
*   **Seamless Workflow**: The transition from Student Draft -> AI Refinement -> Supervisor Review feels intuitive and natural.
*   **Academic Tone Accuracy**: The AI rewriting engine consistently produces high-quality, formal text that sounds like a serious academic paper.

## 📚 What we learned
*   **Prompt Engineering is Key**: The quality of AI output is directly proportional to the specificity of the constraints provided in the prompt.
*   **User Roles Matter**: Building distinct experiences for "Student" and "Supervisor" required careful thought about permissions and data visibility.

## 🚀 What's next for ProjectAssistant
*   **Plagiarism Check Integration**: Integrating APIs like Turnitin to pre-check drafts.
*   **Citation Management**: Auto-formatting references (APA/MLA) from a reliable database.
*   **Mobile App**: A companion app for supervisors to approve drafts on the go.
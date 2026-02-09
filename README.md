# ProjectAssistant

ProjectAssistant is an AI-powered academic writing and supervision platform designed to streamline the research process for students and supervisors. It leverages Google Gemini AI to assist with drafting, structuring, and refining academic content while providing a dedicated dashboard for supervisor review and feedback.

## 🚀 Key Features

### For Students
- **Smart Drafting**: Generate structured chapter drafts (Introduction, Literature Review, Methodology, etc.) using AI-guided templates.
- **Academic Tone Refinement**: Rewrite content to meet academic standards (e.g., "Make Formal", "Objective Tone").
- **Questionnaire Builder**: Create and manage research instruments directly within the platform.
- **Progress Tracking**: Visualize completion status for each chapter.

### For Supervisors
- **Submission Review**: View student drafts in real-time.
- **Inline Feedback**: Add specific comments and requests for revision.
- **Approval Workflow**: Approve chapters or request changes before final export.

## 🛠 Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), React 19
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: SQLite (Development) / PostgreSQL (Production) via [Prisma ORM](https://www.prisma.io/)
- **AI Engine**: [Google Gemini Pro](https://deepmind.google/technologies/gemini/) (`gemini-1.5-pro` or similar)
- **Authentication**: Custom (Sessionless/Token-based simulation)

## 📦 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/project-assistant.git
    cd project-assistant
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Copy the `.env.example` (or create `.env`) and add your API keys:
    ```env
    DATABASE_URL="file:./dev.db"
    GEMINI_API_KEY="your_gemini_api_key_here"
    ```

4.  **Setup Database**:
    Initialize the SQLite database with Prisma:
    ```bash
    npx prisma migrate dev --name init
    ```
    *(Or `npx prisma db push` if you want to skip migrations)*

5.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

6.  **Open the App**:
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

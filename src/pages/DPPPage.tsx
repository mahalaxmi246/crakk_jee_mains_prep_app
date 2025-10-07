import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Target, TrendingUp, ArrowRight, CalendarCheck } from "lucide-react";

// small helper so links use real subjects
const normalizeSubject = (s?: string | null): "math" | "physics" | "chemistry" => {
  const k = String(s || "").toLowerCase();
  if (k === "mathematics" || k === "math") return "math";
  if (k === "chem" || k === "chemistry") return "chemistry";
  if (k === "physics") return "physics";
  // default
  return "math";
};

type Topic = {
  name: string;
  chapters: number;
  progress: number;
  description: string;
  totalProblems: number;
};

type SubjectInfo = {
  name: string;
  color: string;
  topics: Topic[];
};

const DPPPage: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const normSubject = normalizeSubject(subject);

  const subjectData: Record<"mathematics" | "physics" | "chemistry", SubjectInfo> = {
    mathematics: {
      name: "Mathematics",
      color: "blue",
      topics: [
        { name: "Algebra", chapters: 8, progress: 75, description: "Linear equations, quadratic equations, sequences & series", totalProblems: 120 },
        { name: "Calculus", chapters: 6, progress: 60, description: "Differential calculus, integral calculus, limits", totalProblems: 95 },
        { name: "Coordinate Geometry", chapters: 5, progress: 85, description: "Straight lines, circles, parabola, ellipse, hyperbola", totalProblems: 80 },
        { name: "Trigonometry", chapters: 4, progress: 90, description: "Trigonometric functions, identities, equations", totalProblems: 65 },
        { name: "Vector & 3D Geometry", chapters: 3, progress: 45, description: "Vectors, 3D coordinates, planes, lines", totalProblems: 55 },
        { name: "Probability & Statistics", chapters: 4, progress: 70, description: "Probability, permutations, combinations, statistics", totalProblems: 70 },
      ],
    },
    physics: {
      name: "Physics",
      color: "green",
      topics: [
        { name: "Mechanics", chapters: 7, progress: 80, description: "Kinematics, dynamics, work-energy, rotational motion", totalProblems: 110 },
        { name: "Thermodynamics", chapters: 4, progress: 65, description: "Laws of thermodynamics, heat engines, entropy", totalProblems: 60 },
        { name: "Optics", chapters: 5, progress: 75, description: "Ray optics, wave optics, optical instruments", totalProblems: 75 },
        { name: "Electricity & Magnetism", chapters: 8, progress: 55, description: "Electric field, magnetic field, electromagnetic induction", totalProblems: 125 },
        { name: "Modern Physics", chapters: 6, progress: 40, description: "Atomic structure, nuclear physics, quantum mechanics", totalProblems: 85 },
        { name: "Waves & Oscillations", chapters: 3, progress: 85, description: "Simple harmonic motion, wave motion, sound waves", totalProblems: 50 },
      ],
    },
    chemistry: {
      name: "Chemistry",
      color: "orange",
      topics: [
        { name: "Organic Chemistry", chapters: 12, progress: 60, description: "Hydrocarbons, functional groups, biomolecules", totalProblems: 150 },
        { name: "Inorganic Chemistry", chapters: 10, progress: 70, description: "Periodic table, coordination compounds, metallurgy", totalProblems: 130 },
        { name: "Physical Chemistry", chapters: 8, progress: 75, description: "Chemical kinetics, equilibrium, thermodynamics", totalProblems: 100 },
        { name: "Environmental Chemistry", chapters: 2, progress: 90, description: "Environmental pollution, green chemistry", totalProblems: 25 },
        { name: "Chemistry in Everyday Life", chapters: 3, progress: 80, description: "Drugs, polymers, biomolecules", totalProblems: 40 },
      ],
    },
  };

  // pick the right display subject block (your data uses "mathematics"/"physics"/"chemistry")
  const currentSubject =
    normSubject === "math" ? subjectData.mathematics : subjectData[normSubject];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600 bg-green-500";
    if (progress >= 60) return "text-yellow-600 bg-yellow-500";
    return "text-red-600 bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{currentSubject.name} Topics</h1>
              <p className="text-gray-600 mt-2">Choose a topic to start practicing</p>
            </div>
          </div>

          {/* ✅ Solve Today's Problem button (uses normalized subject) */}
          <Link
            to={`/dpp/${normSubject}/daily`}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
            title="Go to today's problem"
          >
            <CalendarCheck size={18} />
            Solve Today’s Problem
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {currentSubject.topics.length}
            </div>
            <div className="text-gray-600">Topics Available</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {currentSubject.topics.reduce((sum: number, t: Topic) => sum + t.chapters, 0)}
            </div>
            <div className="text-gray-600">Total Chapters</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {currentSubject.topics.reduce((sum: number, t: Topic) => sum + t.totalProblems, 0)}
            </div>
            <div className="text-gray-600">Practice Problems</div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {currentSubject.topics.map((topic: Topic, index: number) => (
            <Link
              key={index}
              to={`/dpp/${normSubject}/${topic.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/&/g, "and")}`}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{topic.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{topic.description}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <BookOpen size={16} />
                      <span>{topic.chapters} chapters</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target size={16} />
                      <span>{topic.totalProblems} problems</span>
                    </div>
                  </div>
                </div>

                <ArrowRight
                  size={20}
                  className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all"
                />
              </div>

              {/* Progress Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Your Progress</span>
                  <span className={`text-sm font-medium ${getProgressColor(topic.progress).split(" ")[0]}`}>
                    {topic.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(topic.progress).split(" ")[1]}`}
                    style={{ width: `${topic.progress}%` }}
                  />
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <TrendingUp size={16} className={getProgressColor(topic.progress).split(" ")[0]} />
                  <span className="text-sm text-gray-600">
                    {topic.progress >= 80 ? "Excellent" : topic.progress >= 60 ? "Good Progress" : "Needs Practice"}
                  </span>
                </div>
                <span className="text-purple-600 font-medium text-sm group-hover:text-purple-700">
                  Start Learning
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to master {currentSubject.name}?</h2>
          <p className="text-lg opacity-90 mb-6">
            Choose any topic above and start your structured learning journey with chapter-wise practice problems.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm opacity-80">
            <span>✓ Detailed Solutions</span>
            <span>✓ Progress Tracking</span>
            <span>✓ Difficulty Levels</span>
            <span>✓ Discussion Forums</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DPPPage;

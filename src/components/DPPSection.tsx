// src/components/DPPSection.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Calculator, Atom, FlaskConical, ArrowRight, Target } from "lucide-react";

// ✅ Define a simple helper type for icon components
type IconType = React.FC<React.SVGProps<SVGSVGElement>>;

// ✅ Convert subject name to a clean slug
const toSubjectSlug = (name: string): "math" | "physics" | "chemistry" => {
  const k = name.toLowerCase();
  if (k === "mathematics" || k === "math") return "math";
  if (k === "physics") return "physics";
  return "chemistry";
};

type SubjectCard = {
  name: "Mathematics" | "Physics" | "Chemistry";
  icon: IconType;
  color: string;
  problems: number;
  topics: string[];
};

const DPPSection: React.FC = () => {
  const subjects: SubjectCard[] = [
    {
      name: "Mathematics",
      icon: Calculator as IconType, // ✅ casting fixes the red underline
      color: "bg-blue-500",
      problems: 150,
      topics: ["Algebra", "Calculus", "Coordinate Geometry", "Trigonometry"],
    },
    {
      name: "Physics",
      icon: Atom as IconType,
      color: "bg-green-500",
      problems: 120,
      topics: ["Mechanics", "Thermodynamics", "Optics", "Electromagnetism"],
    },
    {
      name: "Chemistry",
      icon: FlaskConical as IconType,
      color: "bg-orange-500",
      problems: 135,
      topics: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"],
    },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Daily Practice Problems (DPPs)</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const IconComponent = subject.icon;
          const slug = toSubjectSlug(subject.name);

          return (
            <div
              key={subject.name}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`${subject.color} p-3 rounded-lg text-white`}>
                 <IconComponent width={24} height={24} />

                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{subject.name}</h3>
                  <p className="text-sm text-gray-600">{subject.problems} problems available</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Topics Covered:</p>
                <div className="flex flex-wrap gap-2">
                  {subject.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {/* Start Practice */}
                <Link
                  to={`/dpp/${slug}`}
                  className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium group"
                >
                  <span>Start Practice</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Solve Today's Problem */}
                <Link
                  to={`/dpp/${slug}/daily`}
                  className="w-full flex items-center justify-center space-x-2 border border-purple-600 text-purple-600 px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors font-medium group"
                >
                  <Target size={18} />
                  <span>Solve Today&apos;s Problem</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DPPSection;

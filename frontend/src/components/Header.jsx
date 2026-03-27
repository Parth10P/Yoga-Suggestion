import { Leaf } from "lucide-react";

function Header({ hasResult }) {
  return (
    <div
      className={`text-center mb-12 transition-all duration-700 ${
        hasResult ? "mt-4 mb-8 scale-90 opacity-90" : "mt-24"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-6 mb-8">
        <img 
          src="/yoga_logo.png" 
          alt="Omflow Logo" 
          className="w-30 h-30 object-contain drop-shadow-sm"
        />
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight text-[var(--color-on-surface)]">
          Omflow
        </h1>
      </div>
      <p className="text-xl text-[var(--color-on-surface)]/70 font-body max-w-lg mx-auto leading-relaxed">
        Namaste. I'm your Omflow guide. Ask me about specific poses, breathing techniques, or how to design a flow for your mood today.
      </p>
    </div>
  );
}

export default Header;

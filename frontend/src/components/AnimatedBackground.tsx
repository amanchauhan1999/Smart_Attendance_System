'use client';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/8 blur-[120px] animate-[float1_20s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/8 blur-[120px] animate-[float2_25s_ease-in-out_infinite]" />
      <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-blue-500/6 blur-[100px] animate-[float3_18s_ease-in-out_infinite]" />
      <div className="absolute bottom-[20%] left-[20%] w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[90px] animate-[float1_22s_ease-in-out_infinite_reverse]" />

      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,163,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,163,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-400/40"
          style={{
            left: `${(i * 37 + 13) % 100}%`,
            top: `${(i * 53 + 7) % 100}%`,
            animation: `particle ${3 + (i % 4)}s ease-in-out ${(i * 0.5) % 3}s infinite`,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent animate-[scanline_8s_linear_infinite]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

      <style jsx global>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.08); }
          66% { transform: translate(25px, -15px) scale(0.92); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.1); }
        }
        @keyframes particle {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
          50% { opacity: 1; transform: translateY(-20px) scale(1); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}

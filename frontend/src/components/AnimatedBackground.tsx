'use client';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-200/30 blur-[120px] animate-[float1_20s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-200/30 blur-[120px] animate-[float2_25s_ease-in-out_infinite]" />
      <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-blue-200/20 blur-[100px] animate-[float3_18s_ease-in-out_infinite]" />
    </div>
  );
}

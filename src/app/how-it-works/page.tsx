"use client";

import Link from 'next/link';
import { Camera, Search, Heart, Truck, Leaf, DollarSign, Activity, ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50/30 font-sans text-gray-800 overflow-hidden">
            {/* Hero */}
            <div className="text-center py-20 px-4 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full max-w-4xl bg-teal-100/30 blur-3xl rounded-full -z-10"></div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-900 to-teal-600 mb-6 animate-in fade-in slide-in-from-top-4 duration-700 tracking-tight">
                    How it Works?
                </h1>
                <p className="text-xl md:text-2xl text-teal-800/80 max-w-2xl mx-auto font-medium animate-in fade-in slide-in-from-top-8 duration-700 delay-150">
                    A simple cycle of kindness. Turn unused medicine into a lifesaver.
                </p>
            </div>

            {/* Circular Cloud Layout (Desktop) */}
            <div className="relative max-w-5xl mx-auto h-[800px] hidden lg:block my-10">

                {/* Center Core */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center p-12 rounded-full bg-gradient-to-br from-teal-50 to-teal-100/50 backdrop-blur-md shadow-[0_0_60px_rgba(20,184,166,0.15)] z-0">
                    <div className="w-56 h-56 rounded-full border-2 border-dashed border-teal-400/50 flex items-center justify-center animate-spin-slow">
                        {/* Rotating border */}
                    </div>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 flex flex-col items-center justify-center bg-white w-32 h-32 rounded-full shadow-lg border border-teal-50">
                    <Heart className="w-8 h-8 text-teal-500 mb-1" />
                    <span className="font-extrabold text-lg text-teal-900 tracking-tight leading-tight">NeuraMed</span>
                    <span className="text-xs text-teal-600 font-medium">Cycle of Care</span>
                </div>

                {/* Step 1: Top Left - Upload */}
                <div className="absolute top-10 left-20 w-80 group">
                    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-teal-100/50 transform transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_50px_rgba(20,184,166,0.15)] hover:border-teal-300 hover:bg-white relative z-10">
                        <div className="absolute -top-5 -left-5 bg-gradient-to-br from-teal-400 to-teal-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black shadow-lg ring-4 ring-teal-50">1</div>
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-teal-50 rounded-2xl p-4 mb-5 group-hover:bg-teal-100 group-hover:scale-110 transition-all duration-300">
                                <Camera className="w-8 h-8 text-teal-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-teal-900 mb-3">You Upload</h3>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                Snap a photo of your unused medicine strip. Our AI instantly captures details like name and expiry.
                            </p>
                        </div>
                    </div>
                    {/* Arrow to Step 2 */}
                    <svg className="absolute -right-20 top-20 w-24 h-12 text-teal-200/60 transform rotate-12 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} strokeDasharray="4 4" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>

                {/* Step 2: Top Right - Match */}
                <div className="absolute top-10 right-20 w-80 group">
                    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-teal-100/50 transform transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_50px_rgba(20,184,166,0.15)] hover:border-teal-300 hover:bg-white relative z-10">
                        <div className="absolute -top-5 -right-5 bg-gradient-to-br from-teal-400 to-teal-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black shadow-lg ring-4 ring-teal-50">2</div>
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-teal-50 rounded-2xl p-4 mb-5 group-hover:bg-teal-100 group-hover:scale-110 transition-all duration-300">
                                <Search className="w-8 h-8 text-teal-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-teal-900 mb-3">We Match</h3>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                We automatically find verified NGOs nearby that have a specific need for your medicine.
                            </p>
                        </div>
                    </div>
                    {/* Arrow to Step 3 */}
                    <svg className="absolute -bottom-20 right-20 w-12 h-24 text-teal-200/60 transform rotate-90 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} strokeDasharray="4 4" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>

                {/* Step 3: Bottom Right - Collect */}
                <div className="absolute bottom-20 right-20 w-80 group">
                    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-teal-100/50 transform transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_50px_rgba(20,184,166,0.15)] hover:border-teal-300 hover:bg-white relative z-10">
                        <div className="absolute -bottom-5 -right-5 bg-gradient-to-br from-teal-400 to-teal-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black shadow-lg ring-4 ring-teal-50">3</div>
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-teal-50 rounded-2xl p-4 mb-5 group-hover:bg-teal-100 group-hover:scale-110 transition-all duration-300">
                                <Truck className="w-8 h-8 text-teal-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-teal-900 mb-3">They Collect</h3>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                A volunteer picks up the medicine or you drop it off. It undergoes safety checks by pharmacists.
                            </p>
                        </div>
                    </div>
                    {/* Arrow to Step 4 */}
                    <svg className="absolute -left-20 bottom-20 w-24 h-12 text-teal-200/60 transform rotate-180 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} strokeDasharray="4 4" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>

                {/* Step 4: Bottom Left - Impact */}
                <div className="absolute bottom-20 left-20 w-80 group">
                    <div className="bg-gradient-to-br from-teal-500 to-teal-700 text-white p-8 rounded-[2.5rem] shadow-xl border-2 border-white/20 transform transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_50px_rgba(20,184,166,0.4)] hover:bg-gradient-to-br hover:from-teal-400 hover:to-teal-600 relative z-10">
                        <div className="absolute -bottom-5 -left-5 bg-white text-teal-700 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black shadow-lg ring-4 ring-teal-600">4</div>
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-white/20 rounded-2xl p-4 mb-5 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                                <Heart className="w-8 h-8 text-white fill-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Life Saved!</h3>
                            <p className="text-sm text-teal-50 leading-relaxed font-medium">
                                Your donation reaches a patient in need at a charitable clinic or old age home.
                            </p>
                        </div>
                    </div>
                    {/* Arrow to Step 1 (Closing the loop) */}
                    <svg className="absolute -top-20 left-20 w-12 h-24 text-teal-200 transform -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
            </div>

            {/* Mobile Stack Layout (Visible only on small screens) */}
            <div className="lg:hidden max-w-md mx-auto px-4 pb-20 space-y-6 relative">
                {/* Connecting line behind items */}
                <div className="absolute left-11 top-10 bottom-10 w-1 bg-teal-100 -z-10 rounded-full"></div>

                <div className="bg-white p-8 rounded-3xl shadow-lg shadow-teal-900/5 border border-teal-50 flex items-center gap-6 transform transition hover:-translate-y-1">
                    <div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-4 ring-white"><Camera className="w-8 h-8" /></div>
                    <div><h3 className="font-bold text-gray-900 text-xl">1. You Upload</h3><p className="text-base text-gray-600 font-medium mt-1">Scan medicine strip with AI.</p></div>
                </div>
                
                <div className="bg-white p-8 rounded-3xl shadow-lg shadow-teal-900/5 border border-teal-50 flex items-center gap-6 transform transition hover:-translate-y-1">
                    <div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-4 ring-white"><Search className="w-8 h-8" /></div>
                    <div><h3 className="font-bold text-gray-900 text-xl">2. We Match</h3><p className="text-base text-gray-600 font-medium mt-1">Connect with nearby NGOs.</p></div>
                </div>
                
                <div className="bg-white p-8 rounded-3xl shadow-lg shadow-teal-900/5 border border-teal-50 flex items-center gap-6 transform transition hover:-translate-y-1">
                    <div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-4 ring-white"><Truck className="w-8 h-8" /></div>
                    <div><h3 className="font-bold text-gray-900 text-xl">3. They Collect</h3><p className="text-base text-gray-600 font-medium mt-1">Pickup and safety check.</p></div>
                </div>
                
                <div className="bg-gradient-to-br from-teal-500 to-teal-700 text-white p-8 rounded-3xl shadow-xl shadow-teal-900/20 border-2 border-white/20 flex items-center gap-6 transform transition hover:-translate-y-1">
                    <div className="bg-white text-teal-600 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-4 ring-teal-600"><Heart className="w-8 h-8 fill-current" /></div>
                    <div><h3 className="font-bold text-xl text-white">4. Life Saved</h3><p className="text-base text-teal-100 font-medium mt-1">Patient receives help.</p></div>
                </div>
            </div>

            {/* Community Impact Section */}
            <div className="bg-white py-24 relative z-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <span className="bg-teal-50/80 text-teal-700 px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6 inline-block shadow-sm">Impact</span>
                        <h2 className="text-4xl font-extrabold text-teal-900 sm:text-5xl tracking-tight">
                            How It Helps Your Community
                        </h2>
                        <p className="mt-5 text-xl text-gray-500 max-w-3xl mx-auto font-medium">
                            A triple-impact solution for a better world.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Card 1 */}
                        <div className="bg-white rounded-[2rem] p-10 hover:shadow-[0_20px_50px_rgba(20,184,166,0.1)] transition duration-500 border border-gray-100 hover:border-teal-200 group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-green-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition duration-500"></div>
                            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-teal-100 transition-all duration-300">
                                <Leaf className="w-8 h-8 text-teal-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Environmental Protection</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                Medicine expiry is a major waste issue. By redistributing, you prevent toxic chemicals from contaminating landfills and groundwater.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white rounded-[2rem] p-10 hover:shadow-[0_20px_50px_rgba(20,184,166,0.1)] transition duration-500 border border-gray-100 hover:border-teal-200 group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition duration-500"></div>
                            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-teal-100 transition-all duration-300">
                                <DollarSign className="w-8 h-8 text-teal-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Economic Relief</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                Medicines are expensive. Your donation saves substantial costs for low-income families, allowing them to spend on food and education.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white rounded-[2rem] p-10 hover:shadow-[0_20px_50px_rgba(20,184,166,0.1)] transition duration-500 border border-gray-100 hover:border-teal-200 group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-red-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition duration-500"></div>
                            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-teal-100 transition-all duration-300">
                                <Activity className="w-8 h-8 text-teal-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Health Equity</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                We bridge the gap between abundance and scarcity, ensuring that no patient is denied treatment due to lack of resources.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-teal-900 py-20 px-4 text-center">
                <h2 className="text-4xl font-extrabold text-white mb-10">Ready to start the cycle?</h2>
                <Link href="/add-medicine">
                    <button className="bg-white text-teal-900 px-10 sm:px-12 py-5 sm:py-6 rounded-[2rem] font-black text-xl sm:text-2xl hover:bg-teal-50 transition shadow-[0_10px_30px_rgba(255,255,255,0.2)] transform hover:-translate-y-1 active:scale-95 w-full sm:w-auto">
                        Donate Your First Medicine
                    </button>
                </Link>
            </div>
        </div>
    );
}

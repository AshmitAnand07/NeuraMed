"use client";

import Link from 'next/link';
import { Heart, MapPin, ArrowRight, ShieldCheck, Users, Globe } from 'lucide-react';

export default function AboutPage() {
    const ngos = [
        {
            id: 1,
            name: "Seva Kutir Foundation",
            location: "Civil Lines, Delhi",
            work: "Providing free medicines and healthcare support to elderly homes.",
            image: "https://placehold.co/800x600/14b8a6/ffffff?text=Seva+Kutir",
        },
        {
            id: 2,
            name: "Aarogya Life Mission",
            location: "Laxmi Nagar, Delhi",
            work: "Organizing weekly free health checkup camps in slum areas.",
            image: "https://placehold.co/800x600/0f766e/ffffff?text=Aarogya+Life",
        },
        {
            id: 3,
            name: "NeuraMed Plus NGO",
            location: "Connaught Place, Delhi",
            work: "Distributing surplus medicines to charitable clinics across the city.",
            image: "https://placehold.co/800x600/2dd4bf/ffffff?text=NeuraMed+Plus",
        },
        {
            id: 4,
            name: "Hope for All",
            location: "Gurgaon, Haryana",
            work: "Focusing on child nutrition and access to essential vitamins.",
            image: "https://placehold.co/800x600/0d9488/ffffff?text=Hope+for+All",
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Hero Section */}
            <div className="relative bg-teal-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-teal-900 opacity-50 mix-blend-multiply"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center text-center">
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                        Empowering Communities,<br />
                        <span className="text-teal-200">One Medicine at a Time.</span>
                    </h1>
                    <p className="max-w-xl text-lg sm:text-xl text-teal-100 mb-10 leading-relaxed">
                        We bridge the gap between medicine waste and healthcare access. Join us in our mission to ensure no medicine goes to waste.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/register">
                            <button className="px-8 py-3 bg-white text-teal-800 rounded-full font-bold hover:bg-teal-50 transition shadow-lg transform hover:-translate-y-1">
                                Join Mission
                            </button>
                        </Link>
                        <Link href="#ngos">
                            <button className="px-8 py-3 bg-transparent border-2 border-teal-200 text-teal-100 rounded-full font-bold hover:bg-teal-700 hover:text-white transition">
                                View Partners
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Our Values */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <p className="text-teal-600 font-semibold tracking-wide uppercase text-sm">Our Core Values</p>
                    <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Why We Do What We Do
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="bg-teal-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                            <Heart className="text-teal-600 w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
                        <p className="text-gray-600 leading-relaxed">
                            We believe that access to healthcare is a fundamental right. Our platform is built to serve the most vulnerable in our society.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="bg-teal-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                            <ShieldCheck className="text-teal-600 w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Trust & Safety</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Every medicine is verified. Every NGO is vetted. We ensure complete transparency and safety in the donation process.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="bg-teal-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                            <Globe className="text-teal-600 w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Sustainability</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Millions of medicines expire annually. by redistributing them, we reduce waste and protect our environment.
                        </p>
                    </div>
                </div>
            </div>

            {/* NGO Partners Section */}
            <div id="ngos" className="bg-teal-900 py-24 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div>
                            <span className="text-teal-400 font-bold uppercase tracking-wider text-sm shadow-sm">Verified Partners</span>
                            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl text-white">
                                NGOs Making a Difference
                            </h2>
                            <p className="mt-4 max-w-2xl text-lg text-teal-100">
                                We partner with verified NGOs in your area to ensure your medicines reach those who need them most.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-teal-800 px-4 py-2 rounded-full">
                            <MapPin className="text-teal-400 w-5 h-5" />
                            <span className="text-sm font-medium text-teal-100">Near Delhi, India</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {ngos.map((ngo) => (
                            <div key={ngo.id} className="bg-white rounded-xl overflow-hidden shadow-xl transform hover:-translate-y-2 transition duration-300">
                                <div className="h-40 w-full bg-gray-200 relative">
                                    <img
                                        src={ngo.image}
                                        alt={ngo.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-0 right-0 m-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-teal-800">
                                        Verified
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{ngo.name}</h3>
                                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                                        <MapPin className="w-3 h-3" />
                                        <span>{ngo.location}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                        {ngo.work}
                                    </p>
                                    <Link href={`/about/ngo/${ngo.id}`}>
                                        <button className="w-full py-2 border border-teal-100 text-teal-700 text-sm font-bold rounded-lg hover:bg-teal-50 transition flex items-center justify-center gap-2">
                                            View Details <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-white py-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to make an impact?</h2>
                    <p className="text-xl text-gray-500 mb-8">
                        Join thousands of verified users and NGOs in the movement to reduce medicine waste.
                    </p>
                    <Link href="/register">
                        <button className="px-8 py-3 bg-teal-600 text-white rounded-lg font-bold text-lg hover:bg-teal-700 transition shadow-lg">
                            Get Started Today
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

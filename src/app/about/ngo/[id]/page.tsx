"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, Phone, Mail, Globe, ArrowLeft, CheckCircle } from 'lucide-react';

const ngos = [
    {
        id: 1,
        name: "Seva Kutir Foundation",
        location: "Civil Lines, Delhi",
        work: "Providing free medicines and healthcare support to elderly homes.",
        image: "https://placehold.co/800x600/14b8a6/ffffff?text=Seva+Kutir",
        description: "Seva Kutir Foundation has been working tirelessly for the past 10 years to ensure that the elderly population in Delhi receives the medical attention they deserve. We collaborate with various old age homes to conduct regular health checkups and provide essential medicines free of cost.",
        phone: "+91 98765 43210",
        email: "contact@sevakutir.org",
        website: "www.sevakutir.org",
        verified: true,
        stats: {
            livesImpacted: "5,000+",
            medicinesDistributed: "12,000+",
            volunteers: "50+"
        }
    },
    {
        id: 2,
        name: "Aarogya Life Mission",
        location: "Laxmi Nagar, Delhi",
        work: "Organizing weekly free health checkup camps in slum areas.",
        image: "https://placehold.co/800x600/0f766e/ffffff?text=Aarogya+Life",
        description: "Aarogya Life Mission focuses on bringing healthcare to the doorstep of the underprivileged. Our weekly camps in slum clusters provide diagnosis, free medicines, and referrals to government hospitals for serious cases.",
        phone: "+91 91234 56789",
        email: "info@arogyalife.org",
        website: "www.arogyalife.org",
        verified: true,
        stats: {
            livesImpacted: "8,500+",
            medicinesDistributed: "20,000+",
            volunteers: "120+"
        }
    },
    {
        id: 3,
        name: "NeuraMed Plus NGO",
        location: "Connaught Place, Delhi",
        work: "Distributing surplus medicines to charitable clinics across the city.",
        image: "https://placehold.co/800x600/2dd4bf/ffffff?text=NeuraMed+Plus",
        description: "NeuraMed Plus is the bridge between surplus medicine donors and charitable clinics. We collect unused, unexpired medicines from households and pharmacies and redistribute them to verified charitable clinics.",
        phone: "+91 88888 77777",
        email: "support@neuramedplus.org",
        website: "www.neuramedplus.org",
        verified: true,
        stats: {
            livesImpacted: "15,000+",
            medicinesDistributed: "50,000+",
            volunteers: "200+"
        }
    },
    {
        id: 4,
        name: "Hope for All",
        location: "Gurgaon, Haryana",
        work: "Focusing on child nutrition and access to essential vitamins.",
        image: "https://placehold.co/800x600/0d9488/ffffff?text=Hope+for+All",
        description: "Hope for All addresses the critical issue of malnutrition in children. We provide essential vitamins, supplements, and nutritious food to children in low-income families to ensure their healthy growth and development.",
        phone: "+91 76543 21098",
        email: "hello@hopeforall.org",
        website: "www.hopeforall.org",
        verified: true,
        stats: {
            livesImpacted: "3,000+",
            medicinesDistributed: "8,000+",
            volunteers: "30+"
        }
    }
];

export default function NGODetailsPage() {
    const params = useParams();
    const id = Number(params?.id);
    const ngo = ngos.find(n => n.id === id);

    if (!ngo) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">NGO Not Found</h1>
                <Link href="/about" className="text-teal-600 hover:underline">Back to About Page</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/about" className="flex items-center text-gray-500 hover:text-teal-600 transition text-sm font-medium w-fit">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Partners
                    </Link>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                    {/* Hero Image Section */}
                    <div className="h-64 sm:h-80 md:h-96 w-full relative bg-gray-200">
                        <img
                            src={ngo.image}
                            alt={ngo.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 sm:p-10 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">Verified NGO</span>
                                {ngo.verified && <CheckCircle className="w-5 h-5 text-teal-400" />}
                            </div>
                            <h1 className="text-3xl sm:text-5xl font-bold mb-2">{ngo.name}</h1>
                            <div className="flex items-center text-teal-100 text-sm sm:text-base">
                                <MapPin className="w-4 h-4 mr-1" />
                                {ngo.location}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 sm:p-10">

                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Organization</h2>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {ngo.description}
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Their Impact</h2>
                                <div className="grid grid-cols-3 gap-4 border rounded-xl overflow-hidden">
                                    <div className="p-4 bg-teal-50 text-center border-r border-teal-100">
                                        <div className="text-2xl font-bold text-teal-700">{ngo.stats.livesImpacted}</div>
                                        <div className="text-xs text-gray-500 uppercase font-semibold mt-1">Lives Impacted</div>
                                    </div>
                                    <div className="p-4 bg-teal-50 text-center border-r border-teal-100">
                                        <div className="text-2xl font-bold text-teal-700">{ngo.stats.medicinesDistributed}</div>
                                        <div className="text-xs text-gray-500 uppercase font-semibold mt-1">Medicines Shared</div>
                                    </div>
                                    <div className="p-4 bg-teal-50 text-center">
                                        <div className="text-2xl font-bold text-teal-700">{ngo.stats.volunteers}</div>
                                        <div className="text-xs text-gray-500 uppercase font-semibold mt-1">Active Volunteers</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Gallery</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-100 rounded-lg h-40 w-full animate-pulse flex items-center justify-center text-gray-400 text-sm">Activity Photo 1</div>
                                    <div className="bg-gray-100 rounded-lg h-40 w-full animate-pulse flex items-center justify-center text-gray-400 text-sm">Activity Photo 2</div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Contact Information</h3>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-white p-2 rounded-full shadow-sm text-teal-600">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Phone</p>
                                        <p className="text-gray-900 font-medium">{ngo.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-white p-2 rounded-full shadow-sm text-teal-600">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Email</p>
                                        <p className="text-gray-900 font-medium">{ngo.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-white p-2 rounded-full shadow-sm text-teal-600">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Website</p>
                                        <p className="text-gray-900 font-medium hover:text-teal-600 transition cursor-pointer">{ngo.website}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <Link href={`/about/ngo/${ngo.id}/donate`}>
                                    <button className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 transition shadow-lg mb-3">
                                        Donate Medicines
                                    </button>
                                </Link>
                                <button className="w-full bg-white text-gray-700 font-bold py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                    Volunteer with Us
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

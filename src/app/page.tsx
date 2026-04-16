import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image 
            src="/logo.png" 
            alt="VuraPet" 
            width={280} 
            height={80} 
            className="h-20 w-auto"
            priority
          />
        </div>

        <p className="text-gray-600 text-xl mb-2">
          Your Pet's Lifetime Companion
        </p>
        <p className="text-gray-500 text-base mb-8">
          Track health, nutrition, vaccines, memories — and plan for what happens when you can't be there.
        </p>

        <div className="flex gap-4 justify-center">
          <Link 
            href="/auth/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition shadow-sm"
          >
            Login
          </Link>
          <Link 
            href="/auth/signup" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition shadow-sm"
          >
            Sign Up Free
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          🇿🇦 Built in South Africa for pet parents everywhere
        </p>
      </div>
    </div>
  );
}
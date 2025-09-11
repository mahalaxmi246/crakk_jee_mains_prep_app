import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Users, ArrowRight } from 'lucide-react';

const ReferEarnBanner: React.FC = () => {
  return (
    <section>
      <Link
        to="/refer-earn"
        className="block bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="bg-white bg-opacity-20 p-4 rounded-xl">
              <Gift size={32} />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">Refer & Earn</h2>
              <p className="text-lg opacity-90">
                Invite friends and earn rewards for every successful referral
              </p>
              <div className="flex items-center space-x-4 mt-3 text-sm opacity-80">
                <div className="flex items-center space-x-1">
                  <Users size={16} />
                  <span>1 Friend = 100 Points</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Gift size={16} />
                  <span>Redeem for Premium Features</span>
                </div>
              </div>
            </div>
          </div>
          
          <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform flex-shrink-0" />
        </div>
      </Link>
    </section>
  );
};

export default ReferEarnBanner;
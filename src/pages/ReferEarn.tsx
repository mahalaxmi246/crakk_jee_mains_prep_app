import React, { useState } from 'react';
import { Gift, Users, Copy, Share2, Trophy, Star, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/auth/LoginModal';
import SignupModal from '../components/auth/SignupModal';

const ReferEarn: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  
  const referralLink = 'https://crakk.app/ref/john123';
  const userStats = {
    totalReferrals: 12,
    totalPoints: 1200,
    currentLevel: 'Gold',
    nextLevelPoints: 1500
  };

  const { user } = useAuth();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaderboard = [
    { rank: 1, name: 'Rahul Kumar', referrals: 45, points: 4500 },
    { rank: 2, name: 'Priya Singh', referrals: 38, points: 3800 },
    { rank: 3, name: 'Arjun Patel', referrals: 32, points: 3200 },
    { rank: 4, name: 'Sneha Gupta', referrals: 28, points: 2800 },
    { rank: 5, name: 'Vikash Sharma', referrals: 25, points: 2500 },
  ];

  const rewards = [
    { points: 500, reward: '1 Month Premium Access', claimed: true },
    { points: 1000, reward: 'Exclusive Study Material', claimed: true },
    { points: 1500, reward: 'Personal Mentor Session', claimed: false },
    { points: 2000, reward: '₹1000 Cash Reward', claimed: false },
    { points: 3000, reward: 'JEE Main Mock Test Series', claimed: false },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {user ? (
            <>
              <div className="text-center py-8">
                <Gift size={64} className="mx-auto text-purple-600 mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Refer & Earn Rewards</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Invite your friends to Crakk and earn exciting rewards for every successful referral!
                </p>
              </div>

              {/* Referral Link Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Referral Link</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">Share this link with your friends. When they sign up and complete their first practice, you earn points!</p>
                <div className="flex space-x-4">
                  <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center space-x-2">
                    <Share2 size={18} />
                    <span>Share on Social Media</span>
                  </button>
                </div>
              </div>

              {/* Your Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Referral Stats</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-purple-600">{userStats.totalReferrals}</div>
                    <p className="text-gray-600">Total Referrals</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">{userStats.totalPoints}</div>
                    <p className="text-gray-600">Total Points</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-600 flex items-center justify-center space-x-2">
                      <Star size={24} />
                      <span>{userStats.currentLevel}</span>
                    </div>
                    <p className="text-gray-600">Current Level</p>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-4">
                  Earn {userStats.nextLevelPoints - userStats.totalPoints} more points to reach the next level!
                </p>
              </div>

              {/* Rewards Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Rewards You Can Claim</h3>
                <div className="space-y-3">
                  {rewards.map((reward, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{reward.reward}</p>
                        <p className="text-sm text-gray-600">{reward.points} points</p>
                      </div>
                      {reward.claimed ? (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">Claimed</span>
                      ) : (
                        <button 
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={userStats.totalPoints < reward.points}
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Gift size={64} className="mx-auto text-purple-600 mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Crakk to Start Earning!</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Sign up and invite your friends to earn amazing rewards and unlock premium features
              </p>
              <button 
                onClick={() => setShowSignupModal(true)} 
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Sign Up Now
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => { setShowLoginModal(false); setShowSignupModal(true); }}
      />
      <SignupModal
        open={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => { setShowSignupModal(false); setShowLoginModal(true); }}
      />
    </>
  );
};

export default ReferEarn;
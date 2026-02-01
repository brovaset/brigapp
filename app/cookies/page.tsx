'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'

export default function CookiesPage() {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always required
    analytics: false,
    marketing: false
  })

  const getCookieKey = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '') as keyof typeof cookiePreferences
  }

  const cookieTypes = [
    {
      name: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.',
      required: true,
      examples: ['Session management', 'Authentication', 'Security features']
    },
    {
      name: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      required: false,
      examples: ['Page views', 'User behavior', 'Performance metrics']
    },
    {
      name: 'Marketing Cookies',
      description: 'These cookies are used to deliver relevant advertisements and track campaign performance.',
      required: false,
      examples: ['Ad targeting', 'Campaign tracking', 'Conversion measurement']
    }
  ]

  const handleSavePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences))
    alert('Cookie preferences saved!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-gray-600">
            Learn about how we use cookies and manage your preferences
          </p>
        </motion.div>

        <FloatingCard delay={0.1}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
          <p className="text-gray-600 mb-4">
            Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
          </p>
          <p className="text-gray-600">
            BRIGAP uses cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. You can control and manage cookies through your browser settings.
          </p>
        </FloatingCard>

        <div className="my-8 space-y-4">
          {cookieTypes.map((type, index) => (
            <FloatingCard key={index} delay={0.2 + index * 0.1}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{type.name}</h3>
                  <p className="text-gray-600 mb-3">{type.description}</p>
                  <div className="text-sm text-gray-500">
                    <p className="font-semibold mb-1">Examples:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {type.examples.map((example, exIndex) => (
                        <li key={exIndex}>{example}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="ml-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cookiePreferences[getCookieKey(type.name)] || type.required}
                      disabled={type.required}
                      onChange={(e) => {
                        if (!type.required) {
                          const key = getCookieKey(type.name)
                          setCookiePreferences({
                            ...cookiePreferences,
                            [key]: e.target.checked
                          })
                        }
                      }}
                      className="w-5 h-5 text-car-neon border-gray-300 rounded focus:ring-car-neon"
                    />
                    <span className="text-sm text-gray-700">
                      {type.required ? 'Required' : cookiePreferences[getCookieKey(type.name)] ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>
            </FloatingCard>
          ))}
        </div>

        <FloatingCard delay={0.5}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
          <p className="text-gray-600 mb-4">
            You can control cookies through your browser settings. Most browsers allow you to refuse or accept cookies, delete existing cookies, or set preferences for certain websites.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</p>
            <p><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</p>
            <p><strong>Safari:</strong> Preferences → Privacy → Cookies</p>
            <p><strong>Edge:</strong> Settings → Privacy, Search, and Services → Cookies</p>
          </div>
        </FloatingCard>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Save Your Preferences</h3>
          <p className="text-gray-600 mb-4">
            Your cookie preferences will be saved and applied to your browsing experience.
          </p>
          <button
            onClick={handleSavePreferences}
            className="px-6 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg hover:from-car-neon/90 hover:to-car-electric/90 transition-all font-semibold shadow-md"
          >
            Save Cookie Preferences
          </button>
        </motion.div>
      </div>
    </div>
  )
}


'use client'

import React, { useState } from 'react'
import { CareerProfile } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Save, X } from 'lucide-react'

interface ProfileFormProps {
  profile: CareerProfile
  onSave: (data: Partial<CareerProfile>) => void
  onCancel: () => void
}

export default function ProfileForm({ profile, onSave, onCancel }: ProfileFormProps) {
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio)
  const [email, setEmail] = useState(profile.email)
  const [linkedin, setLinkedin] = useState(profile.linkedin)
  const [facebook, setFacebook] = useState(profile.facebook || '')
  const [avatar, setAvatar] = useState(profile.avatar || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = '이름을 입력해주세요'
    }

    if (!bio.trim()) {
      newErrors.bio = '한줄소개를 입력해주세요'
    }

    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요'
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailPattern.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다'
    }

    if (!linkedin.trim()) {
      newErrors.linkedin = '링크드인 URL을 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    onSave({
      name,
      bio,
      email,
      linkedin,
      facebook: facebook || undefined,
      avatar: avatar || undefined,
    })
  }

  return (
    <Card className="border-stone-200">
      <CardHeader>
        <CardTitle>프로필 편집</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이름 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* 한줄소개 */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              한줄소개 <span className="text-red-500">*</span>
            </label>
            <Input
              id="bio"
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="예: 풀스택 개발자 | 블로그 운영자"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              className={errors.bio ? 'border-red-500' : ''}
            />
            {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일 <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* 링크드인 */}
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
              링크드인 URL <span className="text-red-500">*</span>
            </label>
            <Input
              id="linkedin"
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/damipapa"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              className={errors.linkedin ? 'border-red-500' : ''}
            />
            {errors.linkedin && <p className="text-red-500 text-sm mt-1">{errors.linkedin}</p>}
          </div>

          {/* Facebook */}
          <div>
            <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
              Facebook URL (선택)
            </label>
            <Input
              id="facebook"
              type="url"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/jaehan.jeong.7"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>

          {/* 프로필 사진 */}
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
              프로필 사진 경로 (선택)
            </label>
            <Input
              id="avatar"
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="/images/profile.jpg"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="gap-2">
              <X className="w-4 h-4" />
              취소
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="w-4 h-4" />
              저장
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


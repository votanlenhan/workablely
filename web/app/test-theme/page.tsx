'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from 'next-themes';

export default function TestThemePage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Test Theme Toggle</h1>
          <ThemeToggle />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Theme Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Current theme: {theme}</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => setTheme('light')} variant="outline">
                Light
              </Button>
              <Button onClick={() => setTheme('dark')} variant="outline">
                Dark
              </Button>
              <Button onClick={() => setTheme('system')} variant="outline">
                System
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Light Theme Test</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This card should look good in both light and dark themes.
              </p>
              <Button className="mt-4">Primary Button</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dark Theme Test</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Colors should adapt automatically based on the selected theme.
              </p>
              <Button variant="secondary" className="mt-4">Secondary Button</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vietnamese Content Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Đây là nội dung tiếng Việt để test localization.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button variant="outline" size="sm">Tạo Show mới</Button>
                <Button variant="outline" size="sm">Ghi nhận thanh toán</Button>
                <Button variant="outline" size="sm">Báo cáo</Button>
                <Button variant="outline" size="sm">Quản lý nhân viên</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, LogOut, BookOpen, Clock, Award } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  educator: string;
  duration: string;
  lessons: number;
  thumbnail: string;
  materials?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }>;
}

interface Enrollment {
  courseId: string;
  progress: number;
  completedLessons: number;
}

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/auth');
      return;
    }

    // Load courses from localStorage
    const storedCourses = JSON.parse(localStorage.getItem('edtech_courses') || '[]');
    setCourses(storedCourses);

    // Load enrollments
    const storedEnrollments = JSON.parse(localStorage.getItem(`enrollments_${user.id}`) || '[]');
    setEnrollments(storedEnrollments);
  }, [user, navigate]);

  const handleEnroll = (courseId: string) => {
    const newEnrollment = {
      courseId,
      progress: 0,
      completedLessons: 0,
    };
    const updatedEnrollments = [...enrollments, newEnrollment];
    setEnrollments(updatedEnrollments);
    localStorage.setItem(`enrollments_${user?.id}`, JSON.stringify(updatedEnrollments));
    navigate(`/course/${courseId}`);
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some(e => e.courseId === courseId);
  };

  const getEnrollment = (courseId: string) => {
    return enrollments.find(e => e.courseId === courseId);
  };

  const enrolledCourses = courses.filter(course => isEnrolled(course.id));
  const availableCourses = courses.filter(course => !isEnrolled(course.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">EduPlatform</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Learning Dashboard</h2>
          <p className="text-muted-foreground">Track your progress and explore new courses</p>
        </div>

        {enrolledCourses.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              My Courses
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map(course => {
                const enrollment = getEnrollment(course.id);
                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="h-12 w-12 text-primary" />
                        )}
                      </div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>{course.educator}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{enrollment?.progress || 0}%</span>
                        </div>
                        <Progress value={enrollment?.progress || 0} />
                        <p className="text-sm text-muted-foreground">
                          {enrollment?.completedLessons || 0} of {course.lessons} lessons completed
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        Continue Learning
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-secondary" />
            Available Courses
          </h3>
          {availableCourses.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No courses available yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableCourses.map(course => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="h-12 w-12 text-primary" />
                      )}
                    </div>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.educator}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.lessons} lessons
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => handleEnroll(course.id)}
                    >
                      Enroll Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;

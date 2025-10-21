import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GraduationCap, LogOut, Plus, BookOpen, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  educator: string;
  educatorId: string;
  duration: string;
  lessons: number;
  thumbnail: string;
}

const EducatorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    lessons: '0',
  });

  useEffect(() => {
    if (!user || user.role !== 'educator') {
      navigate('/auth');
      return;
    }

    loadCourses();
  }, [user, navigate]);

  const loadCourses = () => {
    const storedCourses = JSON.parse(localStorage.getItem('edtech_courses') || '[]');
    const myCourses = storedCourses.filter((c: Course) => c.educatorId === user?.id);
    setCourses(myCourses);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const allCourses = JSON.parse(localStorage.getItem('edtech_courses') || '[]');
    
    if (editingCourse) {
      // Update existing course
      const updatedCourses = allCourses.map((c: Course) =>
        c.id === editingCourse.id
          ? { ...c, ...formData, lessons: parseInt(formData.lessons) }
          : c
      );
      localStorage.setItem('edtech_courses', JSON.stringify(updatedCourses));
      toast({
        title: 'Course updated',
        description: 'Your course has been updated successfully',
      });
    } else {
      // Create new course
      const newCourse: Course = {
        id: Date.now().toString(),
        ...formData,
        lessons: parseInt(formData.lessons),
        educator: user?.name || '',
        educatorId: user?.id || '',
        thumbnail: '',
      };
      allCourses.push(newCourse);
      localStorage.setItem('edtech_courses', JSON.stringify(allCourses));
      toast({
        title: 'Course created',
        description: 'Your course has been created successfully',
      });
    }

    loadCourses();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      duration: course.duration,
      lessons: course.lessons.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (courseId: string) => {
    const allCourses = JSON.parse(localStorage.getItem('edtech_courses') || '[]');
    const updatedCourses = allCourses.filter((c: Course) => c.id !== courseId);
    localStorage.setItem('edtech_courses', JSON.stringify(updatedCourses));
    loadCourses();
    toast({
      title: 'Course deleted',
      description: 'Your course has been deleted successfully',
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: '',
      lessons: '0',
    });
    setEditingCourse(null);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Courses</h2>
            <p className="text-muted-foreground">Manage and create your courses</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
                <DialogDescription>
                  {editingCourse ? 'Update your course details' : 'Add a new course to your platform'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        placeholder="e.g., 4 weeks"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lessons">Number of Lessons</Label>
                      <Input
                        id="lessons"
                        type="number"
                        min="0"
                        value={formData.lessons}
                        onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                You haven't created any courses yet. Click "Create Course" to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Duration: {course.duration}</p>
                    <p>Lessons: {course.lessons}</p>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(course)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default EducatorDashboard;

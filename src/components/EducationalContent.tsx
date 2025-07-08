import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Award, 
  CheckCircle, 
  PlayCircle,
  Users,
  Bitcoin,
  Shield,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { EmptyEducation, EmptyWalletConnection } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import { useAccount } from 'wagmi';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
  icon: React.ReactNode;
  reward: number; // reputation points
}

// Remove mocked data - will be loaded from API/CMS
const learningModules: LearningModule[] = [
  {
    id: 'bitcoin-basics',
    title: 'Bitcoin Basics',
    description: 'Learn the fundamentals of Bitcoin and why it matters',
    duration: '5 min',
    difficulty: 'Beginner',
    completed: true,
    icon: <Bitcoin className="w-5 h-5" />,
    reward: 10
  },
  {
    id: 'chama-concept',
    title: 'Understanding Chamas',
    description: 'How rotating savings circles work and their benefits',
    duration: '8 min',
    difficulty: 'Beginner',
    completed: true,
    icon: <Users className="w-5 h-5" />,
    reward: 15
  },
  {
    id: 'citrea-network',
    title: 'Citrea Network',
    description: 'Why we use Citrea for Bitcoin-native transactions',
    duration: '6 min',
    difficulty: 'Intermediate',
    completed: false,
    icon: <Shield className="w-5 h-5" />,
    reward: 20
  },
  {
    id: 'reputation-system',
    title: 'Building Reputation',
    description: 'How on-chain reputation improves your lending terms',
    duration: '10 min',
    difficulty: 'Intermediate',
    completed: false,
    icon: <TrendingUp className="w-5 h-5" />,
    reward: 25
  }
];

export const EducationalContent = () => {
  const { isConnected } = useAccount();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modules, setModules] = useState<LearningModule[]>([]);
  
  useEffect(() => {
    const loadEducationalContent = async () => {
      setIsLoading(true);
      try {
        // In a real app, fetch from your CMS/API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For now, set empty array - content would come from API
        setModules([]);
      } catch (error) {
        console.error('Failed to load educational content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEducationalContent();
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    // Reload content
    setTimeout(() => setIsLoading(false), 1000);
  };

  // Show appropriate states
  if (!isConnected) {
    return (
      <EmptyWalletConnection 
        onConnect={() => console.log('Connect wallet')}
      />
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (modules.length === 0) {
    return <EmptyEducation onRefresh={handleRefresh} />;
  }
  
  const completedModules = learningModules.filter(m => m.completed).length;
  const totalRewards = learningModules
    .filter(m => m.completed)
    .reduce((sum, m) => sum + m.reward, 0);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Modules Completed</span>
              <span className="font-semibold">{completedModules}/{learningModules.length}</span>
            </div>
            
            <Progress value={(completedModules / learningModules.length) * 100} />
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-orange-500" />
                <span>Reputation Earned: {totalRewards} points</span>
              </div>
              <Badge variant="secondary">
                {Math.round((completedModules / learningModules.length) * 100)}% Complete
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Modules */}
      <div className="space-y-4">
        <h3 className="font-semibold">Learning Modules</h3>
        
        {learningModules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`cursor-pointer transition-all hover:shadow-md ${
              module.completed ? 'border-green-200 bg-green-50/50' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    module.completed 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    {module.completed ? <CheckCircle className="w-5 h-5" /> : module.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{module.title}</h4>
                      {module.completed && (
                        <Badge variant="secondary" className="text-xs">
                          ✓ Completed
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {module.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{module.duration}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getDifficultyColor(module.difficulty)}`}
                        >
                          {module.difficulty}
                        </Badge>
                        <span>+{module.reward} reputation</span>
                      </div>
                      
                      {!module.completed && (
                        <Button size="sm" variant="outline">
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Achievement Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'First Steps', description: 'Completed first module', earned: true },
              { name: 'Chama Expert', description: 'Learned about chamas', earned: true },
              { name: 'Network Savvy', description: 'Understand Citrea', earned: false },
              { name: 'Reputation Builder', description: 'Master reputation system', earned: false }
            ].map((achievement, index) => (
              <div 
                key={index}
                className={`text-center p-3 rounded-lg border ${
                  achievement.earned 
                    ? 'border-orange-200 bg-orange-50' 
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  achievement.earned 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-sm">{achievement.name}</h4>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

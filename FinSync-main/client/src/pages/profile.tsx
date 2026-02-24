import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { User, Mail, Building, Phone, Calendar, Edit } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex bg-gray-50/50"
    >
      <Sidebar />
      
      <main className="flex-1 ml-64 min-h-screen">
        <Header 
          title="User Profile"
          subtitle="Manage your account information and preferences"
          icon={<User className="w-7 h-7 text-white" />}
        />
        
        <motion.div
          variants={containerVariants}
          className="p-6 space-y-6"
        >
          <motion.div variants={itemVariants}>
            <Card className="professional-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold">Profile Information</CardTitle>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setLocation('/settings')}
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                  <div>
                    <h3 className="text-xl font-semibold">{user?.name || "John Doe"}</h3>
                    <p className="text-gray-600">User Profile</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{user?.name || "John Doe"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-medium">{user?.email || "user@example.com"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Company</p>
                        <p className="font-medium">{user?.company || "FinTech Solutions"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium">January 2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="professional-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Account Security</h3>
                <p className="text-gray-600 text-sm mb-4">Manage your password and security settings</p>
                <Button variant="outline" className="w-full">Change Password</Button>
              </CardContent>
            </Card>
            
            <Card className="professional-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Notification Preferences</h3>
                <p className="text-gray-600 text-sm mb-4">Configure how you receive alerts</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation('/settings')}
                >
                  Manage Settings
                </Button>
              </CardContent>
            </Card>
            
            <Card className="professional-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Billing Information</h3>
                <p className="text-gray-600 text-sm mb-4">View your subscription and payment details</p>
                <Button variant="outline" className="w-full">View Billing</Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}
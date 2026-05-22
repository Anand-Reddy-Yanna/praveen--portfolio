import { Route, Switch } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "./components/ui/toaster";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Login from "./pages/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import HeroSettings from "./pages/admin/HeroSettings";
import SkillsManager from "./pages/admin/SkillsManager";
import ProjectsManager from "./pages/admin/ProjectsManager";
import Messages from "./pages/admin/Messages";
import Settings from "./pages/admin/Settings";


const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <>
      <AnimatePresence mode="wait">
        <Switch>
          <Route path="/">
            <PageWrapper><Home /></PageWrapper>
          </Route>
          <Route path="/projects">
            <PageWrapper><Projects /></PageWrapper>
          </Route>
          <Route path="/login">
            <PageWrapper><Login /></PageWrapper>
          </Route>
          <Route path="/admin" nest>
            <AdminLayout>
              <Route path="/">
                <PageWrapper><HeroSettings /></PageWrapper>
              </Route>
              <Route path="/hero">
                <PageWrapper><HeroSettings /></PageWrapper>
              </Route>
              <Route path="/skills">
                <PageWrapper><SkillsManager /></PageWrapper>
              </Route>
              <Route path="/projects">
                <PageWrapper><ProjectsManager /></PageWrapper>
              </Route>
              <Route path="/messages">
                <PageWrapper><Messages /></PageWrapper>
              </Route>
              <Route path="/settings">
                <PageWrapper><Settings /></PageWrapper>
              </Route>

            </AdminLayout>
          </Route>
        </Switch>
      </AnimatePresence>
      <Toaster />
    </>
  );
}


import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/ui/documentation/MarkdownRenderer";
import { ConnectedAccountsSection } from "@/components/settings/ConnectedAccountsSection";

const Settings = () => {
  const [markdownContent, setMarkdownContent] = useState("");
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  
  const documents = [
    { id: "backend", name: "Backend Structure", path: "/docs/backend-structure.md" },
    { id: "frontend", name: "Frontend Architecture", path: "/docs/frontend-architecture.md" }
  ];
  
  // Function to fetch and display markdown content
  const fetchMarkdownContent = async (path: string) => {
    try {
      const response = await fetch(path);
      const content = await response.text();
      setMarkdownContent(content);
    } catch (error) {
      console.error("Error loading markdown file:", error);
      setMarkdownContent("# Error loading document\n\nUnable to load the requested document.");
    }
  };

  useEffect(() => {
    if (activeDoc) {
      fetchMarkdownContent(activeDoc);
    }
  }, [activeDoc]);

  return (
    <MainLayout pageTitle="Settings">
      <div className="max-w-[1600px] mx-auto animate-fade-up">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="settings">System Settings</TabsTrigger>
            <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This page will provide application configuration options.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="accounts">
            <ConnectedAccountsSection />
          </TabsContent>
          
          <TabsContent value="documentation">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="glass-card md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">Available Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {documents.map(doc => (
                      <button 
                        key={doc.id}
                        onClick={() => setActiveDoc(doc.path)}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors ${
                          activeDoc === doc.path ? 'bg-muted font-medium' : ''
                        }`}
                      >
                        {doc.name}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card md:col-span-3">
                <CardHeader>
                  <CardTitle>
                    {activeDoc 
                      ? documents.find(d => d.path === activeDoc)?.name || "Document" 
                      : "Select a document"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[70vh] w-full pr-4">
                    {markdownContent ? (
                      <MarkdownRenderer content={markdownContent} />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        Select a document from the sidebar to view its contents
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;

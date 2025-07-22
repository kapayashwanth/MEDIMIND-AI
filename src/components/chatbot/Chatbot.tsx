
'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Bot, User, Sparkles } from "lucide-react";
import { cn } from '@/lib/utils';
import { chatbotAction, ChatbotState } from '@/lib/actions/chatbotAction';
import { useFormStatus } from 'react-dom';
import { LoadingSpinner } from '../LoadingSpinner';

type Message = {
  role: 'user' | 'model';
  text: string;
};

const initialState: ChatbotState = {
  response: null,
  error: null,
};

const preloadMessages = [
    "What can this app do?",
    "Tell me about report analysis",
    "What is hypertension?",
];

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="icon" className="shrink-0" disabled={pending}>
            {pending ? <LoadingSpinner size="sm"/> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
        </Button>
    );
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [state, formAction] = useActionState(chatbotAction, initialState);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    if (state.response) {
      setMessages((prev) => [...prev, { role: 'model', text: state.response as string }]);
    }
    if (state.error) {
       setMessages((prev) => [...prev, { role: 'model', text: state.error as string }]);
    }
  }, [state]);
  
  const handleFormSubmit = (formData: FormData) => {
    const userMessage = formData.get('message') as string;
    if (!userMessage.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    formAction(formData);
    setInput('');
  };
  
  const handlePreloadClick = (message: string) => {
    const newFormData = new FormData();
    newFormData.append('message', message);
    // When a preloaded message is clicked, the history is empty
    messages.forEach(msg => {
       newFormData.append('history', JSON.stringify(msg));
    });
    handleFormSubmit(newFormData);
  }

  return (
    <>
      <div className={cn("fixed bottom-6 right-6 z-50", isOpen && "hidden")}>
        <Button size="icon" className="rounded-full w-16 h-16 shadow-lg" onClick={() => setIsOpen(true)}>
          <MessageCircle className="h-8 w-8" />
           <span className="sr-only">Open Chat</span>
        </Button>
      </div>

      <div className={cn("fixed bottom-6 right-6 z-50 transition-opacity", !isOpen && "opacity-0 pointer-events-none")}>
        <Card className="w-[380px] h-[600px] shadow-2xl flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline text-xl">MediMind Assistant</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close Chat</span>
            </Button>
          </CardHeader>
          <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
             <div className="space-y-4 py-4">
                 {messages.length === 0 && (
                     <div className="text-center p-4">
                         <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-2"/>
                         <p className="text-sm text-muted-foreground mb-4">Ask me anything about the app or general health topics!</p>
                         <div className="grid grid-cols-1 gap-2">
                             {preloadMessages.map(msg => (
                                 <Button key={msg} variant="outline" size="sm" onClick={() => handlePreloadClick(msg)}>
                                     {msg}
                                 </Button>
                             ))}
                         </div>
                     </div>
                 )}
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                     {message.role === 'model' && <Bot className="h-6 w-6 text-primary shrink-0" />}
                    <p className={cn(
                        "text-sm p-3 rounded-lg max-w-[80%]",
                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                      {message.text}
                    </p>
                    {message.role === 'user' && <User className="h-6 w-6 shrink-0" />}
                  </div>
                ))}
            </div>
          </ScrollArea>
          <CardFooter className="pt-4 border-t">
            <form 
             ref={formRef}
             action={handleFormSubmit}
             className="flex items-center gap-2 w-full">
               {messages.map((msg, index) => (
                    <input type="hidden" key={index} name="history" value={JSON.stringify(msg)} />
                ))}
              <Input
                name="message"
                placeholder="Type a message..."
                className="flex-1"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <SubmitButton />
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

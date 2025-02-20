import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import FormViewer from "@/pages/form-viewer";

function App() {
  return (
    <>
      <FormViewer />
      <Toaster />
    </>
  );
}

export default App;
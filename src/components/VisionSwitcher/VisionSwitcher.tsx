import React from 'react';
import { Button } from '../Button';
import { Container } from '../Container';

type Vision = 'corporate' | 'casual';

const VisionSwitcher: React.FC = () => {
  const [currentVision, setCurrentVision] = React.useState<Vision>(() => {
    const storedVision = localStorage.getItem('app-vision') as Vision | null;
    return (
      (storedVision ?? (document.documentElement.getAttribute('data-vision') as Vision)) ||
      'corporate'
    );
  });

  const toggleVision = () => {
    const newVision: Vision = currentVision === 'corporate' ? 'casual' : 'corporate';
    setCurrentVision(newVision);

    document.documentElement.setAttribute('data-vision', newVision);
    localStorage.setItem('app-vision', newVision);
  };

  return (
    <Container
      display="flex"
      orientation="row"
      items="center"
      justify="between"
      padding="default"
      rounded="md"
      shadow="md"
      className="bg-background border-border mb-4 border"
    >
      <div className="text-text">
        Current Vision: <span className="text-primary font-bold">{currentVision}</span>
      </div>
      <Button intent="primary" onClick={toggleVision}>
        Switch to {currentVision === 'corporate' ? 'Casual' : 'Corporate'} Vision
      </Button>
    </Container>
  );
};

export { VisionSwitcher };

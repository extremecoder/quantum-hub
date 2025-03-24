// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      query: {},
      pathname: '/',
      asPath: '/',
    };
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
}));

// Mock heroicons
jest.mock('@heroicons/react/outline', () => ({
  SearchIcon: () => <svg data-testid="search-icon" />,
  ChipIcon: () => <svg data-testid="chip-icon" />,
  CloudIcon: () => <svg data-testid="cloud-icon" />,
  LightningBoltIcon: () => <svg data-testid="lightning-bolt-icon" />,
  CubeIcon: () => <svg data-testid="cube-icon" />,
})); 
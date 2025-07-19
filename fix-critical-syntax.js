const fs = require('fs');
const path = require('path');

// List of critical files that need immediate fixing
const criticalFiles = [
  'src/components/auth/AuthGuard.tsx',
  'src/components/ErrorBoundary/StandardErrorBoundary.tsx'
];

function fixCriticalSyntax() {
  let fixedCount = 0;

  criticalFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`Skipping ${filePath} (not found)`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Fix AuthGuard.tsx specific issues
    if (filePath.includes('AuthGuard.tsx')) {
      // Fix missing semicolon in interface
      content = content.replace(/children: React\.ReactNode\s*}/, 'children: React.ReactNode;');
      
      // Fix missing closing brace
      content = content.replace(/return <Navigate to="\/login" state=\{\{ from: location\s*\}\} replace \/>\s*return <>\{children\}<\/>;/, 
        'return <Navigate to="/login" state={{ from: location }} replace />;\n  }\n  return <>{children}</>;');
      
      // Fix spacing around useLocation
      content = content.replace(/location =useLocation\(\)/, 'location = useLocation()');
      
      // Fix if statements
      content = content.replace(/if\(isLoading\)/, 'if (isLoading)');
      content = content.replace(/if\(!user\)/, 'if (!user)');
    }

    // Fix StandardErrorBoundary.tsx specific issues
    if (filePath.includes('StandardErrorBoundary.tsx')) {
      // Fix function parameter syntax
      content = content.replace(/onError\?\: \(error: Error; errorInfo: ErrorInfo\) = > void;/, 
        'onError?: (error: Error, errorInfo: ErrorInfo) => void;');
      
      // Fix property syntax - semicolons to commas in interfaces
      content = content.replace(/level\?: 'page' \| 'section'\s*\| 'component' \| 'global';/, 
        "level?: 'page' | 'section' | 'component' | 'global';");
      content = content.replace(/context\?: Record<string, any>;;/, 'context?: Record<string, any>;');
      
      // Fix interface ending
      content = content.replace(/showDetails: boolean\s*}/, 'showDetails: boolean;');
      
      // Fix constructor syntax
      content = content.replace(/constructor\(props: StandardErrorBoundaryProps\)\s*\{;/, 
        'constructor(props: StandardErrorBoundaryProps) {');
      
      // Fix state object syntax
      content = content.replace(/this\.state = \{hasError: false;/, 'this.state = {\n      hasError: false,');
      content = content.replace(/error: null;/g, 'error: null,');
      content = content.replace(/errorInfo: null;/g, 'errorInfo: null,');
      content = content.replace(/errorId: null;/g, 'errorId: null,');
      content = content.replace(/retryCount: 0;/g, 'retryCount: 0,');
      content = content.replace(/showDetails: false\}\s*}/, 'showDetails: false\n    };');
      
      // Fix method syntax
      content = content.replace(/static getDerivedStateFromError\(error: Error\): Partial<StandardErrorBoundaryState>\s*\{;/, 
        'static getDerivedStateFromError(error: Error): Partial<StandardErrorBoundaryState> {');
      
      // Fix substr parameters
      content = content.replace(/Math\.random\(\)\.toString\(36\)\.substr\(2;\s*9\)/, 
        'Math.random().toString(36).substr(2, 9)');
      
      // Fix method parameters
      content = content.replace(/componentDidCatch\(error: Error; errorInfo: ErrorInfo\)\s*\{;/, 
        'componentDidCatch(error: Error, errorInfo: ErrorInfo) {');
      
      // Fix console.error syntax
      content = content.replace(/console\.error\('Error caught by StandardErrorBoundary:'; error, errorInfo\);/, 
        "console.error('Error caught by StandardErrorBoundary:', error, errorInfo);");
      
      // Fix setState syntax
      content = content.replace(/this\.setState\(\{\s*return, errorInfo;/, 'this.setState({\n      errorInfo');
      
      // Fix try-catch blocks
      content = content.replace(/return try \{/, 'try {');
      content = content.replace(/this\.props\.onError\(error, errorInfo\);;/, 'this.props.onError(error, errorInfo);');
      content = content.replace(/console\.error\('Error in custom error handler:'; handlerError\);/, 
        "console.error('Error in custom error handler:', handlerError);");
      
      // Fix arrow function syntax
      content = content.replace(/this\.setState\(prevState = >\(\{/, 'this.setState(prevState => ({');
      content = content.replace(/hasError: false;/g, 'hasError: false,');
      content = content.replace(/showDetails: false\s*\}\)\)\s*}/, 'showDetails: false\n      }));');
      
      // Fix return statements
      content = content.replace(/return window\.location\.reload\(\);;/, 'window.location.reload();');
      content = content.replace(/return window\.location\.href = '\/';/, "window.location.href = '/';");
      
      // Fix object syntax
      content = content.replace(/const errorReport =\{error: this\.state\.error\.message;/, 
        'const errorReport = {\n        error: this.state.error.message,');
      content = content.replace(/stack: this\.state\.error\.stack;/g, 'stack: this.state.error.stack,');
      content = content.replace(/componentStack: this\.state\.errorInfo\.componentStack;/g, 
        'componentStack: this.state.errorInfo.componentStack,');
      content = content.replace(/level: this\.props\.level;/g, 'level: this.props.level,');
      content = content.replace(/context: this\.props\.context;/g, 'context: this.props.context,');
      content = content.replace(/errorId: this\.state\.errorId;/g, 'errorId: this.state.errorId,');
      content = content.replace(/timestamp: new Date\(\)\.toISOString\(\);/g, 'timestamp: new Date().toISOString(),');
      content = content.replace(/userAgent: navigator\.userAgent;/g, 'userAgent: navigator.userAgent,');
      content = content.replace(/url: window\.location\.href};/, 'url: window.location.href\n      };');
      
      // Fix console.info
      content = content.replace(/console\.info\('Error reported by user:'; errorReport\);/, 
        "console.info('Error reported by user:', errorReport);");
      
      // Fix more arrow functions
      content = content.replace(/return this\.setState\(prevState = > \(\{\s*showDetails: !prevState\.showDetails\s*\}\)\)\s*};/, 
        'this.setState(prevState => ({\n      showDetails: !prevState.showDetails\n    }));');
      
      // Fix variable assignments
      content = content.replace(/const isRetryable =this\.state\.retryCount/, 'const isRetryable = this.state.retryCount');
      
      // Fix JSX prop syntax
      content = content.replace(/elevation=\s*\{3\}/, 'elevation={3}');
      content = content.replace(/sx=\{\{\s*p: 3;/, 'sx={{\n            p: 3,');
      content = content.replace(/maxWidth: 800;/, 'maxWidth: 800,');
      content = content.replace(/mx: 'auto';/, "mx: 'auto',");
      content = content.replace(/backgroundColor: 'background\.paper'\s*\}\}/, "backgroundColor: 'background.paper'\n          }}");
      
      // Fix spacing syntax
      content = content.replace(/spacing=\s*\{2\}/, 'spacing={2}');
      content = content.replace(/spacing=\s*\{1\}/, 'spacing={1}');
      
      // Fix Alert syntax
      content = content.replace(/sx=\{\{\s*mb: 2\s*\}\}/, 'sx={{ mb: 2 }}');
      
      // Fix startIcon syntax
      content = content.replace(/startIcon=\s*\{<Refresh \/>\s*onClick=/, 'startIcon={<Refresh />}\n                  onClick=');
      content = content.replace(/onClick=\s*\{this\.handleRetry\}/, 'onClick={this.handleRetry}');
      content = content.replace(/startIcon=\s*\{<Refresh \/>\s*onClick=/, 'startIcon={<Refresh />}\n                onClick=');
      content = content.replace(/onClick=\s*\{this\.handleReload\}/, 'onClick={this.handleReload}');
      content = content.replace(/startIcon=\s*\{<Home \/>\s*onClick=/, 'startIcon={<Home />}\n                  onClick=');
      content = content.replace(/onClick=\s*\{this\.handleGoHome\}/, 'onClick={this.handleGoHome}');
      content = content.replace(/startIcon=\s*\{<BugReport \/>\s*onClick=/, 'startIcon={<BugReport />}\n                  onClick=');
      content = content.replace(/onClick=\s*\{this\.handleReportError\}/, 'onClick={this.handleReportError}');
      
      // Fix ternary operator
      content = content.replace(/startIcon=\s*\{this\.state\.showDetails \? <ExpandLess \/>\s*: <ExpandMore \/>\s*onClick=/, 
        'startIcon={this.state.showDetails ? <ExpandLess /> : <ExpandMore />}\n                  onClick=');
      content = content.replace(/onClick=\s*\{this\.toggleDetails\}/, 'onClick={this.toggleDetails}');
      
      // Fix sx prop syntax
      content = content.replace(/sx=\{\{\s*alignSelf: 'flex-start'\s*\}\}/, "sx={{ alignSelf: 'flex-start' }}");
      content = content.replace(/\{this\.state\.showDetails \? 'Hide'\s*: 'Show'\}/, "{this.state.showDetails ? 'Hide' : 'Show'}");
      
      // Fix Box sx syntax
      content = content.replace(/sx=\{\{\s*backgroundColor: 'grey\.100';/, "sx={{\n                      backgroundColor: 'grey.100',");
      content = content.replace(/borderRadius: 1;/, 'borderRadius: 1,');
      content = content.replace(/maxHeight: 400;/, 'maxHeight: 400,');
      content = content.replace(/overflow: 'auto'\s*\}\}/, "overflow: 'auto'\n                    }}");
      
      // Fix Typography sx syntax
      content = content.replace(/sx=\{\{\s*fontSize: '0\.75rem'\s*\}\}/, "sx={{ fontSize: '0.75rem' }}");
      content = content.replace(/sx=\{\{\s*mt\s*:\s*2\s*\}\}>/, 'sx={{ mt: 2 }}>');
      
      // Fix optional chaining
      content = content.replace(/\{this\.state\.error\?\s*\.stack\}/, '{this.state.error?.stack}');
      
      // Fix method syntax
      content = content.replace(/private getErrorTitle\(\): string\s*\{/, 'private getErrorTitle(): string {');
      content = content.replace(/const level =this\.props\.level/, 'const level = this.props.level');
      content = content.replace(/default:\s*return 'Component Error'\s*}/, "default:\n        return 'Component Error';\n    }");
      
      // Fix more method syntax
      content = content.replace(/private getErrorMessage\(\): string\s*\{/, 'private getErrorMessage(): string {');
      content = content.replace(/const errorMessage =this\.state\.error\.message\.toLowerCase\(\);/, 
        'const errorMessage = this.state.error.message.toLowerCase();');
      
      // Fix if conditions
      content = content.replace(/if \(errorMessage\.includes\('chunk'\)\s*\|\| errorMessage\.includes\('loading'\)\)/, 
        "if (errorMessage.includes('chunk') || errorMessage.includes('loading'))");
      content = content.replace(/if \(errorMessage\.includes\('network'\)\s*\|\| errorMessage\.includes\('fetch'\)\)/, 
        "if (errorMessage.includes('network') || errorMessage.includes('fetch'))");
      content = content.replace(/if \(errorMessage\.includes\('permission'\)\s*\|\| errorMessage\.includes\('forbidden'\)\)/, 
        "if (errorMessage.includes('permission') || errorMessage.includes('forbidden'))");
      
      // Fix HOC syntax
      content = content.replace(/Component: React\.ComponentType<P>;/, 'Component: React.ComponentType<P>,');
      content = content.replace(/const WrappedComponent =\(props: P\)\s*= >\s*\(/, 'const WrappedComponent = (props: P) => (');
      content = content.replace(/WrappedComponent\.displayName = `withStandardErrorBoundary\(\$\{Component\.displayName\s*\|\| Component\.name\}\)`;/, 
        'WrappedComponent.displayName = `withStandardErrorBoundary(${Component.displayName || Component.name})`;');
      
      // Fix export syntax
      content = content.replace(/export const GlobalErrorBoundary =\(\{ children, \.\.\.props \}: Omit<StandardErrorBoundaryProps, 'level'>\)\s*= >\s*\(/, 
        "export const GlobalErrorBoundary = ({ children, ...props }: Omit<StandardErrorBoundaryProps, 'level'>) => (");
      content = content.replace(/export const PageErrorBoundary =\(\{ children, \.\.\.props \}: Omit<StandardErrorBoundaryProps, 'level'>\)\s*= >\s*\(/, 
        "export const PageErrorBoundary = ({ children, ...props }: Omit<StandardErrorBoundaryProps, 'level'>) => (");
      content = content.replace(/export const SectionErrorBoundary =\(\{ children, \.\.\.props \}: Omit<StandardErrorBoundaryProps, 'level'>\)\s*= >\s*\(/, 
        "export const SectionErrorBoundary = ({ children, ...props }: Omit<StandardErrorBoundaryProps, 'level'>) => (");
      content = content.replace(/export const ComponentErrorBoundary =\(\{ children, \.\.\.props \}: Omit<StandardErrorBoundaryProps, 'level'>\)\s*= >\s*\(/, 
        "export const ComponentErrorBoundary = ({ children, ...props }: Omit<StandardErrorBoundaryProps, 'level'>) => (");
    }

    // Write the file if it changed
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      fixedCount++;
      console.log(`✓ Fixed: ${filePath}`);
    } else {
      console.log(`- No changes needed: ${filePath}`);
    }
  });

  console.log(`\nCritical syntax fixes completed. Fixed ${fixedCount} files.`);
}

fixCriticalSyntax();
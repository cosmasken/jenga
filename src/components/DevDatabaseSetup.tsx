import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function DevDatabaseSetup() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      // Test 1: Basic connection
      console.log('🔄 Testing basic connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (connectionError) {
        setResult({
          success: false,
          step: 'Connection Test',
          error: connectionError,
          message: 'Failed to connect to database. Check environment variables and run the schema.'
        });
        return;
      }

      // Test 2: Check tables exist
      console.log('🔄 Checking table structure...');
      const tables = ['users', 'achievements', 'notifications', 'user_achievements', 'activities'];
      const tableResults = [];

      for (const table of tables) {
        try {
          const { error: tableError } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          tableResults.push({
            table,
            exists: !tableError,
            error: tableError?.message
          });
        } catch (err: any) {
          tableResults.push({
            table,
            exists: false,
            error: err.message
          });
        }
      }

      // Test 3: Try inserting test data
      console.log('🔄 Testing data operations...');
      const testWallet = '0xtest123456789012345678901234567890test';
      
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .upsert({
          wallet_address: testWallet,
          display_name: 'Test User',
          preferred_language: 'en'
        }, {
          onConflict: 'wallet_address'
        })
        .select()
        .single();

      let insertSuccess = !insertError;
      let insertMessage = insertError ? insertError.message : 'Insert successful';

      if (insertSuccess) {
        // Clean up test data
        await supabase
          .from('users')
          .delete()
          .eq('wallet_address', testWallet);
      }

      setResult({
        success: insertSuccess && tableResults.every(t => t.exists),
        connectionTest: !connectionError,
        tableResults,
        insertTest: {
          success: insertSuccess,
          message: insertMessage
        },
        message: insertSuccess && tableResults.every(t => t.exists) 
          ? '✅ Database is ready for development!' 
          : '❌ Database setup incomplete. Run the schema SQL.'
      });

    } catch (err: any) {
      setResult({
        success: false,
        error: err,
        message: `Test failed: ${err.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  const copySchemaInstructions = () => {
    const instructions = `
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Copy and paste the content from: dev_schema_no_rls.sql
4. Click "Run" to execute the schema
5. Come back and click "Test Database" again

The schema file is located at:
/home/groot/Code/akindo/citrea/FINAL/Jenga/dev_schema_no_rls.sql
    `.trim();
    
    navigator.clipboard.writeText(instructions);
    toast.success('Instructions copied to clipboard!');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto m-4">
      <CardHeader>
        <CardTitle>🔧 Development Database Setup</CardTitle>
        <CardDescription>
          Test your Supabase connection and set up the database schema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testConnection}
            disabled={testing}
            variant="default"
          >
            {testing ? 'Testing...' : 'Test Database'}
          </Button>
          
          <Button 
            onClick={copySchemaInstructions}
            variant="outline"
          >
            Copy Setup Instructions
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-4 rounded-lg border bg-slate-50 dark:bg-slate-900">
            <div className={`text-lg font-semibold ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.message}
            </div>
            
            {result.connectionTest !== undefined && (
              <div className="mt-2">
                <strong>Connection:</strong> {result.connectionTest ? '✅ Success' : '❌ Failed'}
              </div>
            )}

            {result.tableResults && (
              <div className="mt-2">
                <strong>Tables:</strong>
                <ul className="ml-4">
                  {result.tableResults.map((table: any) => (
                    <li key={table.table} className={table.exists ? 'text-green-600' : 'text-red-600'}>
                      {table.table}: {table.exists ? '✅ Exists' : `❌ Missing (${table.error})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.insertTest && (
              <div className="mt-2">
                <strong>Data Operations:</strong> 
                <span className={result.insertTest.success ? 'text-green-600' : 'text-red-600'}>
                  {result.insertTest.success ? ' ✅ Working' : ` ❌ ${result.insertTest.message}`}
                </span>
              </div>
            )}

            {result.error && (
              <details className="mt-2">
                <summary className="cursor-pointer text-red-600">🔍 Error Details</summary>
                <pre className="mt-2 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-auto">
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {!result?.success && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Next Steps:</h4>
            <ol className="list-decimal list-inside text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
              <li>Open Supabase dashboard → SQL Editor</li>
              <li>Copy content from <code>dev_schema_no_rls.sql</code></li>
              <li>Run the SQL to create tables</li>
              <li>Click "Test Database" again</li>
            </ol>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <strong>Environment:</strong>
          <br />URL: {supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '❌ Missing'}
          <br />Key: {supabaseAnonKey ? '✅ Present' : '❌ Missing'}
        </div>
      </CardContent>
    </Card>
  );
}

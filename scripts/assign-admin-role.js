const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Create Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function assignAdminRole() {
  try {
    console.log('Buscando usuario administrador@ingenes.com...');
    
    // Get all users to find the one with the specific email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error al obtener usuarios:', listError.message);
      return;
    }
    
    // Find the user with the email administrador@ingenes.com
    const adminUser = users.find(user => user.email === 'administrador@ingenes.com');
    
    if (!adminUser) {
      console.log('Usuario administrador@ingenes.com no encontrado.');
      console.log('Usuarios disponibles:');
      users.forEach(user => console.log(`- ${user.email}`));
      return;
    }
    
    console.log(`Usuario encontrado: ${adminUser.email} (ID: ${adminUser.id})`);
    console.log(`Rol actual: ${adminUser.app_metadata?.role || 'user'}`);
    
    // Update user role to admin
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { app_metadata: { role: 'admin' } }
    );
    
    if (updateError) {
      console.error('Error al actualizar el rol:', updateError.message);
      return;
    }
    
    console.log('✅ Rol de administrador asignado exitosamente a administrador@ingenes.com');
    
    // Verify the update
    const { data: { user: updatedUser }, error: verifyError } = await supabase.auth.admin.getUserById(adminUser.id);
    
    if (verifyError) {
      console.error('Error al verificar la actualización:', verifyError.message);
      return;
    }
    
    console.log(`Rol verificado: ${updatedUser.app_metadata?.role}`);
    
  } catch (error) {
    console.error('Error general:', error.message);
  }
}

// Run the script
assignAdminRole().then(() => {
  console.log('Script completado.');
  process.exit(0);
}).catch((error) => {
  console.error('Error ejecutando el script:', error);
  process.exit(1);
});
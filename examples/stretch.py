# This code solves the nonlinear-elasticity problem in 3D

from dolfin import *

# Define the mesh and function space
mesh = UnitCubeMesh(6, 6, 6)
V = VectorFunctionSpace(mesh, "Lagrange", 1)

# Mark left and right boundaries
left, right = compile_subdomains([
  "x[0] == 0.0",
  "x[0] == 1.0"])

# Define Dirichlet conditions at these
# boundaries
l = Expression(("-0.5", "0.0", "0.0"))
r = Expression(("+0.5", "0.0", "0.0"))

bcl = DirichletBC(V, l, left)
bcr = DirichletBC(V, r, right)
bcs = [bcl, bcr]

# Define functions
du = TrialFunction(V)
v  = TestFunction(V)
u  = Function(V)

# Define body and traction forces
B  = Constant((0.0, 0.0, 0.0))
T  = Constant((0.0, 0.0, 0.0))

# Kinematics
I = Identity(V.cell().d)
F = I + grad(u)
C = F.T*F

# Invariants of deformation tensors
Ic = tr(C)
J  = det(F)

# Elasticity parameters
E = 10.0
nu = 0.3
mu = Constant(E/(2*(1 + nu)))
lmbda = Constant(E*nu/((1 + nu)*(1 - 2*nu)))

# Stored strain energy density (compressible
# neo-Hookean model)
psi = (mu/2)*(Ic - 3) - mu*ln(J) \
    + (lmbda/2)*(ln(J))**2

# Total potential energy
Pi = psi*dx - dot(B, u)*dx - dot(T, u)*ds

# Compute first variation of Pi (directional
# derivative about u in the direction of v)
F = derivative(Pi, u, v)

# Compute Jacobian of F
J = derivative(F, u, du)

# Optimization options for the form compiler
parameters["form_compiler"]["cpp_optimize"] = True
ffc_options = {"optimize": True, \
               "eliminate_zeros": True, \
               "precompute_basis_const": True, \
               "precompute_ip_const": True}

# Solve variational problem
solve(F == 0, u, bcs, J=J,
      form_compiler_parameters=ffc_options)

package pt.up.fe.comp2024.analysis.passes;

import pt.up.fe.comp.jmm.analysis.table.SymbolTable;
import pt.up.fe.comp.jmm.ast.JmmNode;
import pt.up.fe.comp.jmm.report.Report;
import pt.up.fe.comp.jmm.report.Stage;
import pt.up.fe.comp2024.analysis.AnalysisVisitor;
import pt.up.fe.comp2024.ast.Kind;
import pt.up.fe.comp2024.ast.NodeUtils;
import pt.up.fe.specs.util.SpecsCheck;

/**
 * Checks if the type of the expression in a return statement is compatible with the method return type.
 *
 * @author JBispo
 */
public class UndeclaredVariable extends AnalysisVisitor {

    private String currentMethod;
    private boolean isMethodStatic;

    @Override
    public void buildVisitor() {
        addVisit(Kind.METHOD_DECL, this::visitMethodDecl);
        addVisit(Kind.VAR_REF_EXPR, this::visitVarRefExpr);
    }

    private Void visitMethodDecl(JmmNode method, SymbolTable table) {
        currentMethod = method.get("name");
        isMethodStatic = method.get("isStatic").equals("true");
        return null;
    }

    private Void visitVarRefExpr(JmmNode varRefExpr, SymbolTable table) {
        SpecsCheck.checkNotNull(currentMethod, () -> "Expected current method to be set");

        // Check if exists a parameter or variable declaration with the same name as the variable reference
        var varRefName = varRefExpr.get("name");

        // Var is a declared variable, return
        if (table.getLocalVariables(currentMethod).stream()
                .anyMatch(varDecl -> varDecl.getName().equals(varRefName))) {
            varRefExpr.putObject("isStatic", false);
            varRefExpr.putObject("isField",false);
            return null;
        }

        // Var is a parameter, return
        if (table.getParameters(currentMethod).stream()
                .anyMatch(param -> param.getName().equals(varRefName))) {
            varRefExpr.putObject("isStatic", false);
            varRefExpr.putObject("isField",false);
            return null;
        }

        // Var is a field, return
        if (!isMethodStatic && table.getFields().stream()
                .anyMatch(param -> param.getName().equals(varRefName))) {

            varRefExpr.putObject("isStatic", false);
            varRefExpr.putObject("isField",true);

            return null;
        }

        // Var is an import variable , return
        if (table.getImports().stream()
                .anyMatch(imported -> imported.equals(varRefName))) {
            varRefExpr.putObject("type", varRefName);
            varRefExpr.putObject("isStatic", true);
            varRefExpr.putObject("isField",false);
            return null;
        }

        // the class we are in
        var currentClass = table.getClassName();
        if (currentClass.equals(varRefName)) {
            varRefExpr.putObject("type", currentClass);
            varRefExpr.putObject("isStatic", true);
            varRefExpr.putObject("isField",false);
            return null;
        }

        // Create error report
        var message = String.format("Variable '%s' does not exist.", varRefName);
        addReport(Report.newError(
                Stage.SEMANTIC,
                NodeUtils.getLine(varRefExpr),
                NodeUtils.getColumn(varRefExpr),
                message,
                null)
        );

        varRefExpr.putObject("type", null);
        varRefExpr.putObject("isStatic", null);
        varRefExpr.putObject("isField",null);

        return null;
    }


}

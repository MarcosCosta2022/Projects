import java.util.Arrays;
import java.io.*;

public class Main {

    public static double onMult(int m_ar, int m_br) {
        long startTime, endTime;
        double temp;
        double[] pha, phb, phc;

        pha = new double[m_ar * m_ar];
        phb = new double[m_ar * m_ar];
        phc = new double[m_ar * m_ar];

        // initialize matrices
        Arrays.fill(pha, 1.0);
        
        for(int i=0; i<m_br; i++)
            for(int j=0; j<m_br; j++)
                phb[i*m_br + j] = (double)(i+1);

        startTime = System.currentTimeMillis();

        for(int i=0; i<m_ar; i++){
            for(int j=0; j<m_br; j++){
                temp = 0;

                for(int k=0; k<m_ar; k++)
                    temp += pha[i*m_ar+k] * phb[k*m_br+j];

                phc[i*m_ar+j]=temp;
            }
        }

        endTime = System.currentTimeMillis();
        System.out.printf("Time: %3.3f seconds\n", (double)(endTime - startTime) / 1000);

        // display 10 elements of the result matrix to verify correctness
        System.out.println("Result matrix: ");
        for(int i=0; i<1; i++){
            for(int j=0; j<Math.min(10,m_br); j++)
                System.out.print(phc[j] + " ");
        }
        System.out.println();
        return (double)(endTime - startTime)/1000;
    }

    public static double OnMultLine(int m_ar, int m_br) {
        long startTime, endTime;
        double[] pha, phb, phc;

        pha = new double[m_ar * m_ar];
        phb = new double[m_ar * m_ar];
        phc = new double[m_ar * m_ar];

        // initialize matrices
        Arrays.fill(pha, 1.0);
        
        for(int i=0; i<m_br; i++)
            for(int j=0; j<m_br; j++)
                phb[i*m_br + j] = (double)(i+1);

        startTime = System.currentTimeMillis();

        for(int i=0; i<m_ar; i++){
            for(int k=0; k<m_ar; k++){
                for(int j=0; j<m_br; j++)
                    phc[i*m_ar+j] += pha[i*m_ar+k] * phb[k*m_br+j];
            }
        }

        endTime = System.currentTimeMillis();
        System.out.printf("Time: %3.3f seconds\n", (double)(endTime - startTime) / 1000);

        // display 10 elements of the result matrix to verify correctness
        System.out.println("Result matrix: ");
        for(int i=0; i<1; i++){
            for(int j=0; j<Math.min(10,m_br); j++)
                System.out.print(phc[j] + " ");
        }
        System.out.println();

        return (double)(endTime - startTime)/1000;
    }

    public static void testOnMult(int matrix_start, int matrix_end, int matrix_hop, int repeat) {
        double timeCount = 0;

        String filename = "results/multworse_matrix_" + matrix_start + "_to_" + matrix_end + "_results_in_java_repeats" + repeat + ".txt";

        try {
            FileWriter fileWriter = new FileWriter(filename);
            PrintWriter printWriter = new PrintWriter(fileWriter);

            // make header
            printWriter.println("Matrix Size,OnMultTime");

            for (int i = matrix_start; i <= matrix_end; i += matrix_hop) {
                printWriter.print(i);

                timeCount = 0;

                for (int j = 0; j < repeat; j++) {
                    timeCount += onMult(i, i);

                }

                printWriter.print("," + timeCount / repeat);

                printWriter.println();
            }

            // Close the file
            printWriter.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void testOnMultLine(int matrix_start, int matrix_end, int matrix_hop, int repeat) {
        double timeCount = 0;

        String filename = "results/multLine_matrix_" + matrix_start + "_to_" + matrix_end + "_results_in_java_repeats" + repeat + ".txt";

        try {
            FileWriter fileWriter = new FileWriter(filename);
            PrintWriter printWriter = new PrintWriter(fileWriter);

            // make header
            printWriter.println("Matrix Size,OnMultLineTime");

            for (int i = matrix_start; i <= matrix_end; i += matrix_hop) {
                printWriter.print(i);

                timeCount = 0;

                for (int j = 0; j < repeat; j++) {
                    timeCount += OnMultLine(i, i);

                }

                printWriter.print("," + timeCount / repeat);

                printWriter.println();
            }

            // Close the file
            printWriter.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }



    public static void main(String[] args){
        testOnMult(600, 1800, 400 , 20 );
        testOnMult(2200 , 3000, 400, 5);
        

        testOnMultLine(600, 1800, 400 , 20 );
        testOnMultLine(2200 , 3000, 400, 5);
    }

}



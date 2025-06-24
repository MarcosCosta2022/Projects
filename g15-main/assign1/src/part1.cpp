#include <stdio.h>
#include <iostream>
#include <iomanip>
#include <chrono>
#include <cstdlib>
#include <papi.h>
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <omp.h>

using namespace std;

#define SYSTEMTIME clock_t
 
double OnMult(int m_ar, int m_br) {

	chrono::high_resolution_clock::time_point Time1, Time2;
	
	char st[100];
	double temp;
	int i, j, k;

	double *pha, *phb, *phc;

    pha = (double *)malloc((m_ar * m_ar) * sizeof(double));
	phb = (double *)malloc((m_ar * m_ar) * sizeof(double));
	phc = (double *)malloc((m_ar * m_ar) * sizeof(double));

	// initialize matrices
	for(i=0; i<m_ar; i++)
		for(j=0; j<m_ar; j++)
			pha[i*m_ar + j] = (double)1.0;

	for(i=0; i<m_br; i++)
		for(j=0; j<m_br; j++)
			phb[i*m_br + j] = (double)(i+1);

    Time1 = chrono::high_resolution_clock::now();

	for(i=0; i<m_ar; i++){	
		for( j=0; j<m_br; j++){	
			temp = 0;
			for( k=0; k<m_ar; k++)	
				temp += pha[i*m_ar+k] * phb[k*m_br+j];
			phc[i*m_ar+j]=temp;
		}
	}


    Time2 = chrono::high_resolution_clock::now();
	
	chrono::duration<double> duration = chrono::duration_cast<chrono::duration<double>>(Time2-Time1);

	double time = duration.count();
	
	sprintf(st, "Time: %3.3f seconds\n", time);
	cout << st;
	// display 10 elements of the result matrix tto verify correctness
	cout << "Result matrix: " << endl;
	for(i=0; i<1; i++){
	 	for(j=0; j<min(10,m_br); j++)
			cout << phc[j] << " ";
	}
	cout << endl;
	

    free(pha);
    free(phb);
    free(phc);

	return time;
}

// add code here for line x line matriz multiplication
double OnMultLine(int m_ar, int m_br)
{
    chrono::high_resolution_clock::time_point Time1, Time2;
	
	char st[100];
	double temp;
	int i, j, k;

	double *pha, *phb, *phc;

    pha = (double *)malloc((m_ar * m_ar) * sizeof(double));
	phb = (double *)malloc((m_ar * m_ar) * sizeof(double));
	phc = (double *)malloc((m_ar * m_ar) * sizeof(double));

	// initialize matrices
	for(i=0; i<m_ar; i++)
		for(j=0; j<m_ar; j++)
			pha[i*m_ar + j] = (double)1.0;

	for(i=0; i<m_br; i++)
		for(j=0; j<m_br; j++)
			phb[i*m_br + j] = (double)(i+1);

    Time1 = chrono::high_resolution_clock::now();

	for(i=0; i<m_ar; i++){
		for(k=0; k<m_ar; k++){	
			for( j=0; j<m_br; j++)	
				phc[i*m_ar+j] += pha[i*m_ar+k] * phb[k*m_br+j];
		}
	}


    Time2 = chrono::high_resolution_clock::now();
	
	chrono::duration<double> duration = chrono::duration_cast<chrono::duration<double>>(Time2-Time1);

	double time = duration.count();
	
	sprintf(st, "Time: %3.3f seconds\n", time);
	cout << st;

	// display 10 elements of the result matrix tto verify correctness
	cout << "Result matrix: " << endl;
	for(i=0; i<1; i++){
	 	for(j=0; j<min(10,m_br); j++)
			cout << phc[j] << " ";
	}
	cout << endl;
	

    free(pha);
    free(phb);
    free(phc);
    
	return time;
    
}

// add code here for block x block matriz multiplication
float OnMultBlock(int m_ar, int m_br, int bkSize) {

	chrono::high_resolution_clock::time_point Time1, Time2;
    // Implement your function logic here
    // Define variables
	char st[100];
    double *pha, *phb, *phc;
    int i, j, k;

    // Allocate memory for matrices
    pha = (double *)malloc((m_ar * m_ar) * sizeof(double));
    phb = (double *)malloc((m_ar * m_ar) * sizeof(double));
    phc = (double *)calloc((m_ar * m_ar), sizeof(double)); // Initialize with zeros

    // Initialize matrices (iterate through lines and columns - treat array as matrix)
    for (i = 0; i < m_ar; i++)
        for (j = 0; j < m_ar; j++)
            pha[i * m_ar + j] = (double)1.0;

    for (i = 0; i < m_br; i++)
        for (j = 0; j < m_br; j++)
            phb[i * m_br + j] = (double)(i + 1);

	Time1 = chrono::high_resolution_clock::now();
    // Perform matrix multiplication
    for (i = 0; i < m_ar; i += bkSize) {
        for (j = 0; j < m_ar; j += bkSize) {
            for (k = 0; k < m_ar; k += bkSize) {
                // Perform block matrix multiplication
                for (int ii = i; ii < i + bkSize && ii < m_ar; ii++) {
                    for (int jj = j; jj < j + bkSize && jj < m_ar; jj++) {
                        for (int kk = k; kk < k + bkSize && kk < m_ar; kk++) {
                            phc[ii * m_ar + jj] += pha[ii * m_ar + kk] * phb[kk * m_br + jj];
                        }
                    }
                }
            }
        }
    }

	Time2 = chrono::high_resolution_clock::now();
	
	chrono::duration<double> duration = chrono::duration_cast<chrono::duration<double>>(Time2-Time1);

	double time = duration.count();
	
	sprintf(st, "Time: %3.3f seconds\n", time);
	cout << st;
	
    // Display result matrix
    cout << "Result matrix: " << endl;
	for(i=0; i<1; i++){
	 	for(j=0; j<min(10,m_br); j++)
			cout << phc[j] << " ";
	}
	cout << endl;
	

    // Free allocated memory
    free(pha);
    free(phb);
    free(phc);
	
	return time;
}



void handle_error (int retval){
  printf("PAPI error %d: %s\n", retval, PAPI_strerror(retval));
  exit(1);
}

void init_papi() {
  int retval = PAPI_library_init(PAPI_VER_CURRENT);

  if (retval != PAPI_VER_CURRENT && retval < 0) {
    printf("PAPI library version mismatch!\n");
    exit(1);
  }

  if (retval < 0) handle_error(retval);

  std::cout << "PAPI Version Number: MAJOR: " << PAPI_VERSION_MAJOR(retval)
            << " MINOR: " << PAPI_VERSION_MINOR(retval)
            << " REVISION: " << PAPI_VERSION_REVISION(retval) << "\n";
}

double OnMultLineUsingParall1(int m_ar, int m_br)
{
    chrono::high_resolution_clock::time_point Time1, Time2;
	
	char st[100];
	double temp;
	int i, j, k;

	double *pha, *phb, *phc;

    pha = (double *)malloc((m_ar * m_ar) * sizeof(double));
	phb = (double *)malloc((m_ar * m_ar) * sizeof(double));
	phc = (double *)malloc((m_ar * m_ar) * sizeof(double));

	// initialize matrices
	for(i=0; i<m_ar; i++)
		for(j=0; j<m_ar; j++)
			pha[i*m_ar + j] = (double)1.0;

	for(i=0; i<m_br; i++)
		for(j=0; j<m_br; j++)
			phb[i*m_br + j] = (double)(i+1);

    Time1 = chrono::high_resolution_clock::now();

	#pragma omp parallel for private(i,j,k)
	for(i=0; i<m_ar; i++){
		for(k=0; k<m_ar; k++){	
			for( j=0; j<m_br; j++)	
				phc[i*m_ar+j] += pha[i*m_ar+k] * phb[k*m_br+j];
		}
	}


    Time2 = chrono::high_resolution_clock::now();
	
	chrono::duration<double> duration = chrono::duration_cast<chrono::duration<double>>(Time2-Time1);

	double time = duration.count();
	
	sprintf(st, "Time: %3.3f seconds\n", time);
	cout << st;
    
	// display 10 elements of the result matrix tto verify correctness
	cout << "Result matrix: " << endl;
	for(i=0; i<1; i++){
	 	for(j=0; j<min(10,m_br); j++)
			cout << phc[j] << " ";
	}
	cout << endl;
	

    free(pha);
    free(phb);
    free(phc);
    
	return time;
    
}

double OnMultLineUsingParall2(int m_ar, int m_br)
{
    chrono::high_resolution_clock::time_point Time1, Time2;
	
	char st[100];
	double temp;
	int i, j, k;

	double *pha, *phb, *phc;

    pha = (double *)malloc((m_ar * m_ar) * sizeof(double));
	phb = (double *)malloc((m_ar * m_ar) * sizeof(double));
	phc = (double *)malloc((m_ar * m_ar) * sizeof(double));

	// initialize matrices
	for(i=0; i<m_ar; i++)
		for(j=0; j<m_ar; j++)
			pha[i*m_ar + j] = (double)1.0;

	for(i=0; i<m_br; i++)
		for(j=0; j<m_br; j++)
			phb[i*m_br + j] = (double)(i+1);

    Time1 = chrono::high_resolution_clock::now();

	#pragma omp parallel private(i,j,k)
	for(i=0; i<m_ar; i++){
		for(k=0; k<m_ar; k++){
			#pragma omp for
			for( j=0; j<m_br; j++)	
				phc[i*m_ar+j] += pha[i*m_ar+k] * phb[k*m_br+j];
		}
	}


    Time2 = chrono::high_resolution_clock::now();
	
	chrono::duration<double> duration = chrono::duration_cast<chrono::duration<double>>(Time2-Time1);

	double time = duration.count();
	
	sprintf(st, "Time: %3.3f seconds\n", time);
	cout << st;
    
	// display 10 elements of the result matrix tto verify correctness
	cout << "Result matrix: " << endl;
	for(i=0; i<1; i++){
	 	for(j=0; j<min(10,m_br); j++)
			cout << phc[j] << " ";
	}
	cout << endl;
	

    free(pha);
    free(phb);
    free(phc);
    
	return time;
    
}


void testOnMult(int matrix_start, int matrix_end, int matrix_hop, int repeat, int EventSet){
	
	char st[100];
  	long long values[2];
  	int ret;
	ofstream outputFile;
	float time;
	double timeCount = 0;
	long long int ld1Count = 0;
	long long int ld2Count = 0;

	string filename = "results/multworse_matrix_" + to_string(matrix_start) + "_to_" + to_string(matrix_end) + "_results_in_cpp_repeats" + to_string(repeat) + ".txt";
	outputFile.open(filename);

	// make header
	outputFile << "Matrix Size,OnMultTime,OnMultL1D,OnMultL2D" << endl;

	for (int i = matrix_start ; i <= matrix_end ; i+=matrix_hop){
		outputFile << i;

		timeCount = 0;
		ld1Count = 0;
		ld2Count = 0;

		for (int j = 0; j < repeat; j++){
			// Start counting
			ret = PAPI_start(EventSet);
			if (ret != PAPI_OK) cout << "ERROR: Start PAPI" << endl;
			
			timeCount += OnMult(i, i);
			
			ret = PAPI_stop(EventSet, values);
			if (ret != PAPI_OK) cout << "ERROR: Stop PAPI" << endl;

			ld1Count += values[0];
			ld2Count += values[1];
			
			ret = PAPI_reset(EventSet);
			if (ret != PAPI_OK) cout << "FAIL reset" << endl;
			
		}

		outputFile << "," << timeCount / repeat;
		outputFile << "," << ld1Count / repeat << "," << ld2Count / repeat;
		
		outputFile << endl;
	}

	// Close the file
	outputFile.close();

}

void testOnMultLine(int matrix_start, int matrix_end, int matrix_hop, int repeat, int EventSet){
	
	char st[100];
  	long long values[2];
  	int ret;
	ofstream outputFile;
	float time;
	double timeCount = 0;
	long long int ld1Count = 0;
	long long int ld2Count = 0;

	string filename = "results/multLine_matrix_" + to_string(matrix_start) + "_to_" + to_string(matrix_end) + "_results_in_cpp_repeats" + to_string(repeat) + ".txt";
	outputFile.open(filename);

	// make header
	outputFile << "Matrix Size,OnMultLineTime,OnMultLineL1D,OnMultLineL2D" << endl;

	for (int i = matrix_start ; i <= matrix_end ; i+=matrix_hop){
		outputFile << i;

		timeCount = 0;
		ld1Count = 0;
		ld2Count = 0;

		for (int j = 0; j < repeat; j++){
			// Start counting
			ret = PAPI_start(EventSet);
			if (ret != PAPI_OK) cout << "ERROR: Start PAPI" << endl;
			
			timeCount += OnMultLine(i,i);
			
			ret = PAPI_stop(EventSet, values);
			if (ret != PAPI_OK) cout << "ERROR: Stop PAPI" << endl;

			ld1Count += values[0];
			ld2Count += values[1];
			
			ret = PAPI_reset(EventSet);
			if (ret != PAPI_OK) cout << "FAIL reset" << endl;
			
		}

		outputFile << "," << timeCount / repeat;
		outputFile << "," << ld1Count / repeat << "," << ld2Count / repeat;
		
		outputFile << endl;
	}

	// Close the file
	outputFile.close();

}

void testOnMultBlock(int matrix_start, int matrix_end, int matrix_hop, int repeat, vector<int> blockSizes, int EventSet){
	
	char st[100];
  	long long values[2];
  	int ret;
	ofstream outputFile;
	float time;
	double timeCount = 0;
	long long int ld1Count = 0;
	long long int ld2Count = 0;

	string filename = "results/multBlock_matrix_" + to_string(matrix_start) + "_to_" + to_string(matrix_end) + "_results_in_cpp_repeats" + to_string(repeat) + ".txt";
	outputFile.open(filename);

	// make header
	string header = "MatrixSize";

	for (int blocksize : blockSizes){
		header += ",Block"+to_string(blocksize);
	}

	outputFile << header << endl;

	for (int i = matrix_start ; i <= matrix_end ; i+=matrix_hop){
		outputFile << i;

		for(int bls : blockSizes){
			timeCount = 0;
			ld1Count = 0;
			ld2Count = 0;

			for (int j = 0; j < repeat; j++){
				// Start counting
				ret = PAPI_start(EventSet);
				if (ret != PAPI_OK) cout << "ERROR: Start PAPI" << endl;
				
				timeCount += OnMultBlock(i,i,bls);
				
				ret = PAPI_stop(EventSet, values);
				if (ret != PAPI_OK) cout << "ERROR: Stop PAPI" << endl;

				ld1Count += values[0];
				ld2Count += values[1];
				
				ret = PAPI_reset(EventSet);
				if (ret != PAPI_OK) cout << "FAIL reset" << endl;
				
			}

			outputFile << "," << timeCount / repeat;
			outputFile << "," << ld1Count / repeat << "," << ld2Count / repeat;
		}

		outputFile << endl;
	}

	// Close the file
	outputFile.close();

}

void testOnMultParal1(int matrix_start, int matrix_end, int matrix_hop, int repeat, int EventSet){
	
	char st[100];
  	long long values[2];
  	int ret;
	ofstream outputFile;
	float time;
	double timeCount = 0;
	long long int ld1Count = 0;
	long long int ld2Count = 0;

	string filename = "results/multParal1_matrix_" + to_string(matrix_start) + "_to_" + to_string(matrix_end) + "_results_in_cpp_repeats" + to_string(repeat) + ".txt";
	outputFile.open(filename);

	// make header
	outputFile << "Matrix Size,OnMultParal1Time,OnMultParal1L1D,OnMultParal1L2D" << endl;

	for (int i = matrix_start ; i <= matrix_end ; i+=matrix_hop){
		outputFile << i;

		timeCount = 0;
		ld1Count = 0;
		ld2Count = 0;

		for (int j = 0; j < repeat; j++){
			// Start counting
			ret = PAPI_start(EventSet);
			if (ret != PAPI_OK) cout << "ERROR: Start PAPI" << endl;
			
			timeCount += OnMultLineUsingParall1(i,i);
			
			ret = PAPI_stop(EventSet, values);
			if (ret != PAPI_OK) cout << "ERROR: Stop PAPI" << endl;

			ld1Count += values[0];
			ld2Count += values[1];
			
			ret = PAPI_reset(EventSet);
			if (ret != PAPI_OK) cout << "FAIL reset" << endl;
			
		}

		outputFile << "," << timeCount / repeat;
		outputFile << "," << ld1Count / repeat << "," << ld2Count / repeat;
		
		outputFile << endl;
	}

	// Close the file
	outputFile.close();

}


void testOnMultParal2(int matrix_start, int matrix_end, int matrix_hop, int repeat, int EventSet){
	
	char st[100];
  	long long values[2];
  	int ret;
	ofstream outputFile;
	float time;
	double timeCount = 0;
	long long int ld1Count = 0;
	long long int ld2Count = 0;

	string filename = "results/multParal2_matrix_" + to_string(matrix_start) + "_to_" + to_string(matrix_end) + "_results_in_cpp_repeats" + to_string(repeat) + ".txt";
	outputFile.open(filename);

	// make header
	outputFile << "Matrix Size,OnMultParal2Time,OnMultParal2L1D,OnMultParal2L2D" << endl;

	for (int i = matrix_start ; i <= matrix_end ; i+=matrix_hop){
		outputFile << i;

		timeCount = 0;
		ld1Count = 0;
		ld2Count = 0;

		for (int j = 0; j < repeat; j++){
			// Start counting
			ret = PAPI_start(EventSet);
			if (ret != PAPI_OK) cout << "ERROR: Start PAPI" << endl;
			
			timeCount += OnMultLineUsingParall1(i,i);
			
			ret = PAPI_stop(EventSet, values);
			if (ret != PAPI_OK) cout << "ERROR: Stop PAPI" << endl;

			ld1Count += values[0];
			ld2Count += values[1];
			
			ret = PAPI_reset(EventSet);
			if (ret != PAPI_OK) cout << "FAIL reset" << endl;
			
		}

		outputFile << "," << timeCount / repeat;
		outputFile << "," << ld1Count / repeat << "," << ld2Count / repeat;
		
		outputFile << endl;
	}

	// Close the file
	outputFile.close();

}


int main (int argc, char *argv[]){

	omp_set_num_threads(4);
	
	int EventSet = PAPI_NULL;
  	int ret;

	ret = PAPI_library_init( PAPI_VER_CURRENT);
	if (ret != PAPI_VER_CURRENT) cout << "FAIL" << endl;

	ret = PAPI_create_eventset(&EventSet);
	if (ret != PAPI_OK) cout << "ERROR: create eventset" << endl;

	ret = PAPI_add_event(EventSet,PAPI_L1_DCM);
	if (ret != PAPI_OK) cout << "ERROR: PAPI_L1_DCM" << endl;

	ret = PAPI_add_event(EventSet,PAPI_L2_DCM);
	if (ret != PAPI_OK) cout << "ERROR: PAPI_L2_DCM" << endl;

	
	testOnMult(600,1800,400, 20, EventSet);
	testOnMult(2200,3000,400, 5, EventSet);

	testOnMultLine(600, 1800, 400, 20, EventSet);
	testOnMultLine(2200, 3000, 400, 5, EventSet);
	testOnMultLine(4096, 10240, 2048, 5, EventSet);

	vector<int> blockSizes = {64 , 128 , 256};
	testOnMultBlock(4096, 10240, 2048, 5, blockSizes, EventSet); 
	
	testOnMultParal1(600, 3000, 400, 10, EventSet);
	testOnMultParal2(600, 3000, 400 , 10, EventSet);

	
	ret = PAPI_remove_event(EventSet, PAPI_L1_DCM);
	if (ret != PAPI_OK) cout << "FAIL remove event" << endl; 

	ret = PAPI_remove_event( EventSet, PAPI_L2_DCM);
	if (ret != PAPI_OK) cout << "FAIL remove event" << endl; 

	ret = PAPI_destroy_eventset(&EventSet);
	if (ret != PAPI_OK) cout << "FAIL destroy" << endl;

}
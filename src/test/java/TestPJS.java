import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.LinkedList;
import java.util.List;

public class TestPJS {
    public String exportChart(String phantomjsPath, String pjsPath, String url, String uri, String imageSavePath,
                            String jsonPath, String reportType, String reportName, boolean isPDF) {
        List<String> paramList = new LinkedList<String>();
        paramList.add(phantomjsPath);
        paramList.add(pjsPath);
        paramList.add(url);// 1
        paramList.add(uri);// 2
        paramList.add(imageSavePath);// 3
        paramList.add(jsonPath);// 4
        paramList.add(reportType);// 5
        paramList.add(reportName);// 6
        paramList.add(isPDF + "");// 6

        StringBuilder stringBuilder = null;
        String[] parameters = paramList.toArray(new String[paramList.size()]);

        try {
            Process process = Runtime.getRuntime().exec(parameters);

            int exitStatus = process.waitFor();
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(process.getInputStream()));

            String currentLine = null;
            stringBuilder = new StringBuilder(exitStatus == 0 ? "SUCCESS" : "ERROR:");
            currentLine = bufferedReader.readLine();

            while (currentLine != null) {
                stringBuilder.append(currentLine);
                currentLine = bufferedReader.readLine();
            }
            System.out.println(stringBuilder.toString());

        } catch (Exception e) {
            throw new IllegalStateException("Cannot execute script " + pjsPath, e);
        }

        return stringBuilder.toString();
    }

    // Transactional : Transactional Mailing Report :<Report Name>
    // Program :Lifecycle Program Report :<Reprort Name>
    // Batch : Batch Mailing Report : <Report Name>
    public static void main(String[] args) {
        try {
            boolean isPDF = false;
            // for luo
            String path = "/Users/luo/WORK";
            String projectPath = "/workspace_snow/luo/phantomjsHighchart/phantomjsHighchart";
            String phantomjsPath = path + "/tool/phantomjs-1.9.8-macosx/bin/phantomjs";
            String dataPath = path + projectPath + "/src/main/resources/2";
            String visitAddress = "http://localhost:8080/phantomjs-highchart";
            // for gao
            // String path = "/Users/bin_gao/Documents/workspace-4";
            // String projectPath = "/phantomjsHighchart";
            // String phantomjsPath = "/usr/local/bin/phantomjs";
            // String dataPath = path + projectPath + "/src/main/resources/2";
            // String visitAddress = "http://localhost:8080/";

            String pjsPath = path + projectPath + "/src/main/resources/pjs.js";
            String visitUri = "/";
            String reportName = "TEST";
            //
            String imageSavePath = path + projectPath + "/src/main/resources/0batchsummary.png";
            String jsonPath = dataPath + "/batchsummary.json";
            String reportType = "BATCH";// BATCH|TRANSACTIONAL|PROGRAM
            new TestPJS().exportChart(phantomjsPath, pjsPath, visitAddress, visitUri, imageSavePath, jsonPath, reportType, reportName, isPDF);
            //
            imageSavePath = path + projectPath + "/src/main/resources/0transactionalsummary.png";
            jsonPath = dataPath + "/transactionalsummary.json";
            reportType = "TRANSACTIONAL";// BATCH|TRANSACTIONAL|PROGRAM
            new TestPJS().exportChart(phantomjsPath, pjsPath, visitAddress, visitUri, imageSavePath, jsonPath, reportType, reportName, isPDF);
            //
            imageSavePath = path + projectPath + "/src/main/resources/0progamsummary.png";
            jsonPath = dataPath + "/progamsummary.json";
            reportType = "PROGRAM";// BATCH|TRANSACTIONAL|PROGRAM
            new TestPJS().exportChart(phantomjsPath, pjsPath, visitAddress, visitUri, imageSavePath, jsonPath, reportType, reportName, isPDF);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
